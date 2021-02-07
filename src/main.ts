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
	'<rect width="100" height="100" fill="white"/>\n' +
	'<rect width="100" height="100" fill="black"/>\n' +
	'<path fill-rule="evenodd" clip-rule="evenodd" d="M15.9498 13.9497C14.683 15.2165 12.933 16 11 16C7.13401 16 4 12.866 4 9C4 5.13401 7.13401 2 11 2C14.866 2 18 5.13401 18 9C18 10.5723 17.4816 12.0235 16.6064 13.1921L19.4317 16.0174C21.4036 14.1473 24.0678 13 27 13C30.8296 13 34.2021 14.957 36.172 17.9255L47.2564 10.8838C47.0893 10.2844 47 9.65263 47 9C47 5.13401 50.134 2 54 2C57.866 2 61 5.13401 61 9C61 9.05071 60.9995 9.1013 60.9984 9.15176L69.6848 14.1526C72.4347 10.9954 76.4843 9 81 9C89.2843 9 96 15.7157 96 24C96 32.2843 89.2843 39 81 39C77.6001 39 74.4644 37.8689 71.9487 35.9624L61.0884 46.8227C61.6736 48.0939 62 49.5088 62 51C62 51.3375 61.9833 51.6711 61.9506 52H73.0549C73.5524 47.5 77.3674 44 82 44C86.9706 44 91 48.0294 91 53C91 57.9706 86.9706 62 82 62C77.0294 62 73 57.9706 73 53H61.7999C60.8734 57.5645 56.8379 61 52 61C50.5088 61 49.0939 60.6736 47.8227 60.0884L34.3813 73.5297C35.4934 75.1521 36.2948 77.0041 36.6999 79H73.414C74.7199 74.383 78.9649 71 84 71C90.0751 71 95 75.9249 95 82C95 88.0751 90.0751 93 84 93C78.9649 93 74.7199 89.617 73.414 85H36.6999C35.3101 91.8467 29.2569 97 22 97C13.7157 97 7 90.2843 7 82C7 73.7157 13.7157 67 22 67C24.9714 67 27.741 67.864 30.0713 69.3545L43.3702 56.0556C42.8227 55.1231 42.4221 54.094 42.2 53H32C32 57.9706 27.9706 62 23 62C18.0294 62 14 57.9706 14 53C14 48.0294 18.0294 44 23 44C27.6326 44 31.4476 47.5 31.9451 52H42.0494C42.0167 51.6711 42 51.3375 42 51C42 45.4772 46.4771 41 52 41C53.8444 41 55.5722 41.4993 57.0556 42.3702L67.9771 31.4486C67.1959 30.0857 66.6225 28.5884 66.3001 27H37.5859C36.2801 31.617 32.0351 35 27 35C20.9249 35 16 30.0751 16 24C16 21.2169 17.0336 18.6752 18.7379 16.7378L15.9498 13.9497ZM69.0454 14.9384L60.8899 10.2432C60.3033 13.5161 57.4417 16 54 16C51.1481 16 48.6946 14.2946 47.6036 11.8479L36.6867 18.7833C37.0629 19.4804 37.3661 20.2227 37.5859 21H66.3001C66.7553 18.7572 67.711 16.6961 69.0454 14.9384Z" fill="white" fill-opacity="0.3"/>\n' +
	'<path fill-rule="evenodd" clip-rule="evenodd" d="M96 24C96 32.2843 89.2843 39 81 39C77.6001 39 74.4644 37.8689 71.9487 35.9624L61.0884 46.8227C61.6736 48.0939 62 49.5088 62 51C62 56.5228 57.5228 61 52 61C50.5088 61 49.0939 60.6736 47.8227 60.0884L34.3813 73.5297C35.4934 75.1521 36.2948 77.0041 36.6999 79H73.414C74.7199 74.383 78.9649 71 84 71C90.0751 71 95 75.9249 95 82C95 88.0751 90.0751 93 84 93C78.9649 93 74.7199 89.617 73.414 85H36.6999C35.3101 91.8467 29.2569 97 22 97C13.7157 97 7 90.2843 7 82C7 73.7157 13.7157 67 22 67C24.9714 67 27.741 67.864 30.0713 69.3545L43.3702 56.0556C42.4993 54.5722 42 52.8444 42 51C42 45.4772 46.4771 41 52 41C53.8444 41 55.5722 41.4993 57.0556 42.3702L67.9771 31.4486C67.1959 30.0857 66.6225 28.5884 66.3001 27H37.5859C36.2801 31.617 32.0351 35 27 35C20.9249 35 16 30.0751 16 24C16 17.9249 20.9249 13 27 13C32.0351 13 36.2801 16.383 37.5859 21H66.3001C67.6899 14.1533 73.7431 9 81 9C89.2843 9 96 15.7157 96 24Z" fill="white" fill-opacity="0.4"/>\n' +
	'</svg>\n');

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

		console.log("Searching for journey between " + startBasename + " and " + endBasename);

		let resolvedLinks = this.app.metadataCache.resolvedLinks;

		// configure directed true/false
		var g = new Graph({ });

		for (let key in resolvedLinks) {
			let filePath = key;
			let nodeBasename = filePath // filePath.replace(".md", "");

			// skipping/excluding node creation based on folders
			if(this.settings.skipFoldersList().length > 0) {
				for(var i = 0; i <= this.settings.skipFoldersList().length; i++) {
					if(nodeBasename.contains(this.settings.skipFoldersList()[i])) {
						// console.log("Skipping adding " + nodeBasename + " as node");
						continue;
					}
				}
			}

			g.setNode(nodeBasename);
			// console.log("Creating node " + nodeBasename);

			let valueMap = resolvedLinks[key];

			if(!this.settings.skipMOCs || !(valueMap.length > this.settings.MOCMaxLinks)) {
				// look at each link
				for(let linkKey in valueMap) {
					let target = linkKey;
					let targetClean = target

					// exclude/skip folders forward/backward link
					if(this.settings.skipFoldersList().length > 0) {
						for(var i = 0; i <= this.settings.skipFoldersList().length; i++) {
							if(targetClean.contains(this.settings.skipFoldersList()[i])) {
								// console.log("Skipping adding " + targetClean + " as target");
								continue;
							}
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
				// console.log("Skipping edge creation for " + nodeBasename + " with too many (" + valueMap.length + "/" + this.settings.MOCMaxLinks + ") links");
			}

			if(this.settings.useTags) {
				const text = await this.app.vault.adapter.read(filePath);
				// @ts-ignore
				const result = text.matchAll(/\#\w+/gmi);
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
		console.log(this.filePathList);
		const rand = Math.floor(Math.random() * this.filePathList.length) + 1
		return this.filePathList[rand];
	}

	private setupFileList() {
		let resolvedLinks = this.app.metadataCache.resolvedLinks;
		this.filePathList = [];

		for (let key in resolvedLinks) {
			let filePath = key;

			// exclude folders if set
			if(this.plugin.settings.skipFoldersList().length > 0) {
				for(var i = 0; i < this.plugin.settings.skipFoldersList().length; i++) {
					if(filePath.contains(this.plugin.settings.skipFoldersList()[i])) {
						console.log("Skipping adding " + filePath + " as search option because " + this.plugin.settings.skipFoldersList()[i]);
						break;
					} else {
						this.filePathList.push(filePath);
						break;
					}
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

		console.log("Searching for:" + value);
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
		let result = "## The Journey Between " + this.results.first()  + " and " + this.results.last() + "\n";

		// @ts-ignore
		this.results.forEach(function(x) {
			result += "- " + x + "\n";
		});

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

	constructor() {
		this.useForwardLinks = true;
		this.useBackLinks = true;
		this.useTags = true;
		this.skipMOCs = false;
		this.MOCMaxLinks = 30;
		this.enableHighContrast = false;
		this.skipFolders = "";
	}

	skipFoldersList() {
		if (this.skipFolders == undefined) return [];
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

		containerEl.createEl("h3", {text: "Visual Settings"});

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

new Notice("Journey Re-Loaded!");