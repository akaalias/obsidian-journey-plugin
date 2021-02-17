import {
	addIcon,
	App,
	DropdownComponent,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	SearchComponent,
	Setting, TextComponent
} from 'obsidian';
import { Graph } from 'graphlib';
import * as graphlib from "graphlib";
import {kMaxLength} from "buffer";

addIcon('journey', '<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
	'<g clip-path="url(#clip0)">\n' +
	'<path d="M50 92.75C44.0004 87.6326 38.4394 82.0223 33.375 75.9778C25.775 66.9005 16.75 53.382 16.75 40.5C16.7433 27.0459 24.8452 14.9137 37.2751 9.76469C49.705 4.61573 64.0128 7.46495 73.522 16.9828C79.7752 23.2082 83.2781 31.6764 83.2502 40.5C83.2502 53.382 74.225 66.9005 66.625 75.9778C61.5606 82.0223 55.9996 87.6326 50 92.75ZM50 16.7501C36.8898 16.7658 26.2657 27.3898 26.25 40.5C26.25 46.0385 28.7533 55.6288 40.6663 69.8835C43.6024 73.3893 46.7178 76.7409 50 79.925C53.2825 76.7447 56.3994 73.3979 59.3385 69.8978C71.2468 55.624 73.75 46.0338 73.75 40.5C73.7343 27.3898 63.1103 16.7658 50 16.7501ZM50 54.75C42.13 54.75 35.75 48.3701 35.75 40.5C35.75 32.63 42.13 26.2501 50 26.2501C57.8701 26.2501 64.25 32.63 64.25 40.5C64.25 44.2794 62.7487 47.9039 60.0763 50.5763C57.4039 53.2487 53.7794 54.75 50 54.75Z" fill="#777777"/>\n' +
	'</g>\n' +
	'<defs>\n' +
	'<clipPath id="clip0">\n' +
	'<rect width="100" height="100" fill="white"/>\n' +
	'</clipPath>\n' +
	'</defs>\n' +
	'</svg>');

export default class JourneyPlugin extends Plugin {
	private searchModal: SearchModal;
	private resultsModal: ResultsModal;
	public settings: JourneyPluginSettings;

	async onload() {
		this.loadSettings();
		this.addSettingTab(new JourneyPluginSettingsTab(this.app, this));

		this.addRibbonIcon('journey', 'Find Journey', () => {
			this.startSearch();
		});
	}

	public async findShortestPath(start: string, end: string) {

		const startBasename = start;
		const endBasename = end;

		// console.log("Searching for journey between " + startBasename + " and " + endBasename);

		let resolvedLinks = this.app.metadataCache.resolvedLinks;

		// configure directed true/false
		var g = new Graph({ });

		for (let key in resolvedLinks) {
			let filePath = key;
			let nodeBasename = filePath // filePath.replace(".md", "");

			// skipping/excluding node creation based on folders
			if(this.settings.skipFoldersList().length > 0) {
				var clean = true;
				for(var i = 0; i <= this.settings.skipFoldersList().length; i++) {
					if(nodeBasename.contains(this.settings.skipFoldersList()[i])) {
						// console.log("Skipping adding " + nodeBasename + " as node");
						clean = false;
					}
				}

				// skip this loop
				if(!clean) {
					continue;
				}
			}

			g.setNode(nodeBasename);
			// console.log("Creating node " + nodeBasename);

			let valueMap = resolvedLinks[key];

			let outboundLinkCounter = 0;
			if(this.settings.skipMOCs) {
				for(let linkKey in valueMap) {
					outboundLinkCounter++;
				}
			}

			if(!this.settings.skipMOCs || !(outboundLinkCounter > this.settings.MOCMaxLinks)) {
				// look at each link
				for(let linkKey in valueMap) {
					let target = linkKey;
					let targetClean = target

					// exclude/skip folders forward/backward link
					if(this.settings.skipFoldersList().length > 0) {
						var clean = true;
						for(var i = 0; i <= this.settings.skipFoldersList().length; i++) {
							if(targetClean.contains(this.settings.skipFoldersList()[i])) {
								clean = false;
							}
						}

						if(!clean) {
							continue;
						}
					}

					if(this.settings.useForwardLinks) {
						// console.log("     Adding FORWARDLINK edge " + nodeBasename + " -> " + target);
						g.setEdge(nodeBasename, targetClean);
					}

					// allow backlinks
					if(this.settings.useBackLinks) {
						// console.log("     Adding BACKLINK edge " + target + " -> " + nodeBasename);
						g.setEdge(targetClean, nodeBasename);
					}
				}
			} else {
				// console.log("Skipping edge creation for " + nodeBasename + " with too many (" + outboundLinkCounter + "/" + this.settings.MOCMaxLinks + ") links");
			}

			if(this.settings.useTags) {
				const text = await this.app.vault.adapter.read(filePath);
				// @ts-ignore
				const result = text.matchAll(/\#[\w|äÄöÖüÜß\/\-\_]+/gmi);
				const ts = Array.from(result);

				for(var i = 0; i < ts.length; i++) {
					let tag = String(ts[i]);
					// @ts-ignore
					tag = tag.trim();

					if(!g.hasNode(tag)) {
						// console.log("Adding Tag node" + tag)
						g.setNode(tag);
					}
					if(!g.hasEdge(nodeBasename, tag)) {
						// console.log("Adding edge " + nodeBasename + " -> " + tag);
						g.setEdge(nodeBasename, tag);
					}
					if(!g.hasEdge(tag, nodeBasename)) {
						// console.log("Adding edge " + tag + " -> " + nodeBasename);
						g.setEdge(tag, nodeBasename);
					}
				}
			}
		}

		const searchResult = graphlib.alg.dijkstra(g, startBasename);

		let finalList = new Array();

		// console.log(searchResult);

		if(searchResult[endBasename] !== undefined && searchResult[endBasename].distance !== Infinity) {
			let step = searchResult[endBasename];
			finalList.push(endBasename);

			while(step.distance != 0) {
				finalList.push(step.predecessor);
				step = 	searchResult[step.predecessor];
			}
		}
		this.searchModal.close();
		this.searchModal = new SearchModal(this.app, this);
		this.resultsModal = new ResultsModal(this.app, this);
		this.resultsModal.results = finalList;
		this.resultsModal.startBasename = startBasename;
		this.resultsModal.endBasename = endBasename;
		this.resultsModal.open();
	}

	public startSearch() {
		this.searchModal = new SearchModal(this.app, this);
		this.searchModal.open();
	}

	private loadSettings() {
		this.settings = new JourneyPluginSettings();
		(async () => {
			const loadedSettings = await this.loadData();
			if (loadedSettings) {
				this.settings.useForwardLinks = loadedSettings.useForwardLinks;
				this.settings.useBackLinks = loadedSettings.useBackLinks;
				this.settings.useTags = loadedSettings.useTags;
				this.settings.skipMOCs = loadedSettings.skipMOCs;
				this.settings.MOCMaxLinks = loadedSettings.MOCMaxLinks;
				this.settings.enableHighContrast = loadedSettings.enableHighContrast;
				this.settings.skipFolders = loadedSettings.skipFolders;
				this.settings.enableLinks = loadedSettings.enableLinks;
				this.settings.enableTransclusion = loadedSettings.enableTransclusion;
			} else {
				this.saveData(this.settings);
			}
		})();
	}
}

class SearchModal extends Modal {
	private plugin: JourneyPlugin;
	private filePathList: string[];
	private searchStart: TextComponent;
	private searchEnd: TextComponent;
	private formDiv: HTMLDivElement;

	constructor(app: App, plugin: JourneyPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		let {contentEl} = this;
		contentEl.createEl("h2", {text: "Find the Story Between Two Notes"});
		this.formDiv = contentEl.createDiv({cls: 'journey-search-form'})
		
		this.setupFileList();
		this.addStartSearchComponent();
		this.addEndSearchComponent();
		this.addSearchButton(contentEl);
		this.addLuckyButton();
		this.addSearchSettingsDisplay();
	}

	private findRandomNoteBasename() {
		// console.log(this.filePathList);
		const rand = Math.floor(Math.random() * this.filePathList.length) + 1
		return this.filePathList[rand];
	}

	private setupFileList() {
		let resolvedLinks = this.app.metadataCache.resolvedLinks;
		this.filePathList = [];
		// console.log(this.plugin.settings.skipFoldersList());

		for (let key in resolvedLinks) {
			let filePath = key;

			// exclude folders if set
			if(this.plugin.settings.skipFoldersList().length > 0) {
				var clean = true;
				for(var i = 0; i < this.plugin.settings.skipFoldersList().length; i++) {
					if(filePath.contains(this.plugin.settings.skipFoldersList()[i])) {
						clean = false;
						// console.log("Skipping adding " + filePath + " as search option because " + this.plugin.settings.skipFoldersList()[i]);
					}
				}

				// if it's still clean...
				if(clean) {
					this.filePathList.push(filePath);
				}
			} else {
				this.filePathList.push(filePath);
			}
		}
	}

	private addSearchSettingsDisplay() {
		// add showing which settings are on
		this.formDiv.createEl("br");
		let via: string = "Settings: ";
		if (this.plugin.settings.useForwardLinks) {
			via += "✔ Forwardlinks ";
		}
		if (this.plugin.settings.useBackLinks) {
			via += "✔ Backlinks ";
		}
		if (this.plugin.settings.useTags) {
			via += "✔ Tags";
		}

		let avoid = "";
		if (this.plugin.settings.skipMOCs) {
			avoid = "✔ Avoid notes with " + this.plugin.settings.MOCMaxLinks + " or more links "
		}

		let visual = "";
		if (this.plugin.settings.enableHighContrast) {
			visual = "✔ High-Contrast ";
		}

		let excludeSkip = ""
		if (this.plugin.settings.skipFoldersList().length > 0) {
			excludeSkip = "✔ Skipping " + this.plugin.settings.skipFolders + " ";
		}

		this.formDiv.createEl("p", {text: via + " " + avoid + " " + visual + " " + excludeSkip, cls: 'discovery-settings'});
	}

	private addLuckyButton() {
		let lucky = this.formDiv.createEl('p', {cls: 'journey-search-lucky', text: 'I feel lucky'});
		var luckyFunction = (function () {
			this.searchStart.setValue(this.findRandomNoteBasename());
			this.searchEnd.setValue(this.findRandomNoteBasename());
		}).bind(this);

		lucky.onclick = luckyFunction;
	}

	private addSearchButton(contentEl: HTMLElement) {
		let button = this.formDiv.createEl('input', {
			type: 'submit',
			cls: 'journey-input-button',
			value: 'Find Journey'
		});

		var searchFunction = (function () {
			contentEl.replaceWith(contentEl.createEl("h2", {text: "Searching..."}));
			this.plugin.findShortestPath(this.searchStart.getValue(), this.searchEnd.getValue());
		}).bind(this);

		button.onclick = searchFunction;
	}

	private addEndSearchComponent() {
		this.searchEnd = new TextComponent(this.formDiv);
		this.searchEnd.setPlaceholder("Your Ending Note Title")
		let autocompleteResultEnd = this.formDiv.createDiv({cls: 'journey-search-autocomplete-results-container hide-me'});
		this.searchEnd.onChange(value => {
			this.autocomplete(value, autocompleteResultEnd, this.searchEnd);
		});
	}

	private addStartSearchComponent() {
		this.searchStart = new TextComponent(this.formDiv);
		this.searchStart.setPlaceholder("Your Starting Note Title")
		let autocompleteResultStart = this.formDiv.createDiv({cls: 'journey-search-autocomplete-results-container hide-me'});
		this.searchStart.onChange(value => {
			this.autocomplete(value, autocompleteResultStart, this.searchStart);
		});
	}

	private autocomplete(value: string, autocompleteResult: HTMLDivElement, targetElement: TextComponent) {

		autocompleteResult.innerHTML = "";

		let autocompleteResultContent = createDiv({cls: 'journey-search-autocomplete-results-content'});
		autocompleteResult.appendChild(autocompleteResultContent);

		// console.log("Searching for:" + value);
		if(!(value.length > 3)) {
			autocompleteResult.addClass("hide-me");
			return;
		}

		// console.log("Here are the files for auto-complete:");
		// console.log(this.filePathList);

		let searchResults = [];

		for(var i = 0; i < this.filePathList.length; i++) {
			if(this.filePathList[i].toUpperCase().includes(value.toUpperCase())) {
				// console.log("Found: " + this.markdownFiles[i].basename);
				searchResults.push(this.filePathList[i]);
			}
		}

		var limit = searchResults.length;
		if(limit > 5) {limit = 5};
		autocompleteResultContent.innerHTML = "";

		for(var i = 0; i < limit; i++) {
			let li = createDiv({text: searchResults[i], cls: 'journey-search-autocomplete-results-content-item'});

			li.addEventListener("click", function() {
				let text = li.getText();
				targetElement.setValue(text);
				autocompleteResult.removeClass("show-me");
				autocompleteResult.addClass("hide-me");
			}.bind(this));

			autocompleteResultContent.appendChild(li);
		}

		autocompleteResult.removeClass("hide-me");
		autocompleteResult.addClass("show-me");
	}

	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}
}

class ResultsModal extends Modal {
	private plugin;
	// @ts-ignore
	public results;
	public startBasename: string;
	public endBasename: string;

	constructor(app: App, plugin: JourneyPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		// console.log(this.results);
		let {contentEl} = this;

		let anotherSearch = contentEl.createEl("p", {text: "Start another search", cls: 'journey-result-list-reset-link'});

		var boundFunctionAnotherSearch = (function() {
			this.close();
			this.plugin.startSearch();
		}).bind(this);

		anotherSearch.onclick = boundFunctionAnotherSearch;

		if(this.results.length <= 0) {
			let noSearchResult = createDiv();
			noSearchResult.appendChild(createEl("h2", {text: "No Journey Found between " + this.startBasename + " and " + this.endBasename}));
			noSearchResult.appendChild(createEl("p", {text: "Here are some possible reasons why:" }));
			let explanationList = createEl('ul');

			if(!this.plugin.settings.useForwardLinks) {
				explanationList.createEl('li', {text: 'You currently have forward-links disabled in your settings'});
			}

			if(!this.plugin.settings.useBackLinks) {
				explanationList.createEl('li', {text: 'You currently have back-links disabled in your settings'});
			}

			if(!this.plugin.settings.useTags) {
				explanationList.createEl('li', {text: 'You currently have tags disabled in your settings'});
			}

			if(this.plugin.settings.skipMOCs) {
				explanationList.createEl('li', {text: 'You currently have skipping MOCs with more than ' + this.plugin.settings.MOCMaxLinks + ' outbound links enabled'});
			}

			if(this.plugin.settings.skipFolders) {
				explanationList.createEl('li', {text: 'You currently have skipping folders enabled'});
			}

			explanationList.createEl('li', {text: 'The two notes may not be in the same network.'});

			noSearchResult.appendChild(explanationList);
			noSearchResult.appendChild(anotherSearch);

			contentEl.replaceWith(noSearchResult);
		} else {
			let listClass = 'journey-result-list';
			if(this.plugin.settings.enableHighContrast) {
				listClass = 'journey-result-list-high-contrast';
			}

			let list = createDiv({cls: listClass});

			let reversedResults = this.results.reverse();
			for(var i = 0; i < reversedResults.length; i++) {
				let text = reversedResults[i];
				let cls = "journey-result-list-item-note";

				if(i == 0) cls = "journey-result-list-item-start";
				if(i == reversedResults.length - 1) cls = "journey-result-list-item-end";
				if(text.match(/^\#\w+/)) cls = "journey-result-list-item-tag"

				list.appendChild(createDiv({text: text, cls: cls}))
			}
			contentEl.appendChild(list);

			let button = contentEl.createEl('input', {type: 'submit', cls: 'journey-input-button', value: 'Copy to Clipboard'});
			var boundFunctionButton = (function() {
				this.saveToClipboard();
			}).bind(this);

			button.onclick = boundFunctionButton;

			contentEl.appendChild(contentEl.createEl("hr"));

			contentEl.appendChild(button)

			contentEl.appendChild(anotherSearch);
		}
	}

	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}

	saveToClipboard() {
		if (this.results.length > 0) {
			navigator.clipboard.writeText(this.createClipboardContent());
			new Notice("Journey copied to clipboard!");
		}
	}

	createClipboardContent(): string {
		let result = "## The Journey Between " + this.results.first().replace(".md", "")  + " and " + this.results.last().replace(".md", "") + "\n";

		for(var i = 0; i < this.results.length; i++) {
			let noteTitle = this.results[i].replace(".md", "");

			if(this.plugin.settings.enableLinks && !(noteTitle.startsWith("#"))) {
				noteTitle = "[[" + noteTitle + "]]";
			}

			if(this.plugin.settings.enableLinks && this.plugin.settings.enableTransclusion) {
				if(!(noteTitle.startsWith("#"))) {
					result += "!" + noteTitle + "\n";
				} else {
					result += noteTitle + "\n";
				}
			} else {
				result += "- " + noteTitle + "\n";
			}
		}

		return result;
	}
}

class JourneyPluginSettings {
	public useForwardLinks: boolean;
	public useBackLinks: boolean;
	public useTags: boolean;
	public skipMOCs: boolean;
	public MOCMaxLinks: number;
	public enableHighContrast: boolean;
	public skipFolders: string;
	public enableLinks: boolean;
	public enableTransclusion: boolean;

	constructor() {
		this.useForwardLinks = true;
		this.useBackLinks = true;
		this.useTags = true;
		this.skipMOCs = false;
		this.MOCMaxLinks = 30;
		this.enableHighContrast = false;
		this.skipFolders = "";
		this.enableLinks = false;
		this.enableTransclusion = false;
	}

	skipFoldersList() {
		if (this.skipFolders == undefined || this.skipFolders == "") return [];
		return this.skipFolders.split(",").map(function(item) {
			return item.trim();
		});
	}
}

class JourneyPluginSettingsTab extends PluginSettingTab {
	private readonly plugin: JourneyPlugin;
	public MOCMaxLinksCounter: HTMLDivElement;

	constructor(app: App, plugin: JourneyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl("h2", {text: "Journey Plugin Settings"});

		new Setting(containerEl)
			.setName("Use Forward-links")
			.setDesc("If set, allows to travel using forward-links. If you have a graph like this: A -> B -> C and you ask about the story between A and C, it will give you 'A, B, C' since A forward-links to B and B forward-links to C")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.useForwardLinks).onChange((value) => {
					this.plugin.settings.useForwardLinks = value;
					this.plugin.saveData(this.plugin.settings);
				}),
			);

		new Setting(containerEl)
			.setName("Use Back-links")
			.setDesc("If set, allows to travel using back-links. If you have a graph like this: A -> B -> C and you ask about the story between C and A, it will give you 'C, B, A' since C has a back-link from B and B has a back-link from A")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.useBackLinks).onChange((value) => {
					this.plugin.settings.useBackLinks = value;
					this.plugin.saveData(this.plugin.settings);
				}),
			);

		containerEl.createEl("h3", {text: "Include Tags"});

		new Setting(containerEl)
			.setName("Use Tags")
			.setDesc("If set, allows to travel using tags. ")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.useTags).onChange((value) => {
					this.plugin.settings.useTags = value;
					this.plugin.saveData(this.plugin.settings);
				}),
			);

		containerEl.createEl("h3", {text: "Avoid traveling via certain notes and folders"});

		new Setting(containerEl)
			.setName("Take the scenic route")
			.setDesc("If set, will skip 'hub' notes with too many links (MOCs). Configure exactly how many links make a MOC below.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.skipMOCs).onChange((value) => {
					this.plugin.settings.skipMOCs = value;
					this.plugin.saveData(this.plugin.settings);
				}),
			);

		new Setting(containerEl)
			.setName("How many links make a MOC?")
			.setDesc("Configure at which point to skip a note because it contains too many out-bound links. Applies only if 'Take the scenic route' above is set.")
			.addSlider((toggle) =>
				toggle.setValue(this.plugin.settings.MOCMaxLinks).onChange((value) => {
					this.MOCMaxLinksCounter.setText("Max link count: " + String(value));
					this.plugin.settings.MOCMaxLinks = value;
					this.plugin.saveData(this.plugin.settings);
				}),
			);
		this.MOCMaxLinksCounter = containerEl.createDiv({cls: 'moc-max-links-counter', text: "Max link count: " + this.plugin.settings.MOCMaxLinks});


		new Setting(containerEl)
			.setName("Exclude folders")
			.setDesc("If set, will note include notes from the specified folders in your search. Please use comma to deliminate several folders")
			.addText((text) =>
				text
					.setPlaceholder("Daily Notes/, Attachments/")
					.setValue(this.plugin.settings.skipFolders)
					.onChange((value) => {
						this.plugin.settings.skipFolders = value;
						this.plugin.saveData(this.plugin.settings);
					})
			);

		containerEl.createEl("h3", {text: "Clipboard Settings"});

		new Setting(containerEl)
			.setName("Enable Automatic Linking")
			.setDesc("If set, will turn titles in the list into links to their respective note")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableLinks).onChange((value) => {
					this.plugin.settings.enableLinks = value;
					this.plugin.saveData(this.plugin.settings);
				}),
			);

		new Setting(containerEl)
			.setName("Enable Automatic Transclusion")
			.setDesc("If set, will automatically create transcluding links for you ('![[note]]' instead of '- [[note]]')")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableTransclusion).onChange((value) => {
					this.plugin.settings.enableTransclusion = value;
					this.plugin.saveData(this.plugin.settings);
				}),
			);

		containerEl.createEl("h3", {text: "Accessibility Settings"});

		new Setting(containerEl)
			.setName("Enable High Contrast")
			.setDesc("If set, will increase the contrast to make the result-list easier to read.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableHighContrast).onChange((value) => {
					this.plugin.settings.enableHighContrast = value;
					this.plugin.saveData(this.plugin.settings);
				}),
			);
	}
}