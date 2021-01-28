import { App, Modal, Notice, Plugin } from 'obsidian';
import { Graph } from 'graphlib';
import * as graphlib from "graphlib";

export default class MyPlugin extends Plugin {
	private searchModal: SearchModal;
	private resultsModal: ResultsModal;

	async onload() {
		this.resultsModal = new ResultsModal(this.app, this);
		this.searchModal = new SearchModal(this.app, this);
		this.addStatusBarItem().setText('');

		this.addRibbonIcon('dot-network', 'Find Journey', () => {
			this.searchModal.open();
		});
	}

	onunload() {
	}

	public async findShortestPath(start: string, end: string) {

		const startBasename = start;
		const endBasename = end;

		console.log("Searching for journey between " + startBasename + " and " + endBasename);

		// get md files
		let mdFiles = this.app.vault.getMarkdownFiles();

		var g = new Graph({ directed: true, compound: false, multigraph: true });

		for (const md of mdFiles) {
			const nodeBasename = md.basename;
			g.setNode(nodeBasename);

			let text = await this.app.vault.adapter.read(md.path);
			const result = text.matchAll(/\[\[(\w.*)\]\]/gi); // only clean links for now
			const r = Array.from(result);
			r.forEach(function(x) {
				const target = x[1];
				g.setEdge(nodeBasename, target);
			});
		}

		const searchResult = graphlib.alg.dijkstra(g, startBasename);

		let finalList = new Array();

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
		this.resultsModal.open();
	}
}

class SearchModal extends Modal {
	private plugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		let {contentEl} = this;
		contentEl.createEl("h2", {text: "Find Path Between Two Notes"});

		contentEl.createEl("label", {text: "Start Note"});
		let start = contentEl.createEl('input', {text: "Creative Remixing", type: "text", cls: 'journey-input-text'});
		contentEl.createEl("br")
		contentEl.createEl("label", {text: "End Note"});
		let end = contentEl.createEl('input', {text: "Huel", type: "text", cls: 'journey-input-text'});
		let button = contentEl.createEl('input', {type: 'submit', cls: 'journey-input-button', value: 'Find Journey'});

		var boundFunction = (function() {
			contentEl.replaceWith(contentEl.createEl("h2", {text: "Searching..."}));
			this.plugin.findShortestPath(start.value, end.value);
		}).bind(this);

		button.onclick = boundFunction;
	}

	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}
}

class ResultsModal extends Modal {
	private plugin;
	public results;

	constructor(app: App, plugin: MyPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		console.log(this.results);
		let {contentEl} = this;
		contentEl.createEl("h2", {text: "Results:"})

		if(this.results.length <= 0) {
			contentEl.replaceWith(contentEl.createEl("h2", {text: "No Path Found."}));
		} else {
			let list = createDiv({cls: 'journey-result-list'});

			let reversedResults = this.results.reverse();
			for(var i = 0; i < reversedResults.length; i++) {
				let text = reversedResults[i];
				let cls = "journey-result-list-item";

				if(i == 0) cls = "journey-result-list-item-start";
				if(i == reversedResults.length - 1) cls = "journey-result-list-item-end";

				list.appendChild(createDiv({text: text, cls: cls}))
			}
			contentEl.appendChild(list);

			let button = contentEl.createEl('input', {type: 'submit', cls: 'journey-input-button', value: 'Copy to Clipboard'});
			var boundFunction = (function() {
				this.saveToClipboard();
			}).bind(this);

			button.onclick = boundFunction;

			contentEl.appendChild(contentEl.createEl("hr"));

			contentEl.appendChild(button)
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

		this.results.forEach(function(x) {
			result += "- " + x + "\n";
		});

		return result;
	}
}
