import { App, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
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

		// console.log("Starting adding md files.")

		for (const md of mdFiles) {
			const nodeBasename = md.basename;
			// add to graph as node
			// console.log("Adding " + nodeBasename);

			g.setNode(nodeBasename);

			// find links
			let text = await this.app.vault.adapter.read(md.path);
			const result = text.matchAll(/\[\[(\w.*)\]\]/gi); // only clean links for now
			const r = Array.from(result);

			// console.log("   Adding " + r.length + " links for " + nodeBasename + ":");

			r.forEach(function(x) {
				const target = x[1];
				// console.log("       " + target);
				g.setEdge(nodeBasename, target);
			});
			// open and find links
			// add links as edges
		}
		// console.log("Finished adding md files.")

		// console.log("Node count: " + g.nodeCount());
		// console.log("Edge count: " + g.edgeCount());

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
		let start = contentEl.createEl('input', {type: "text", cls: 'journey-input-text'});
		contentEl.createEl("br")
		contentEl.createEl("label", {text: "End Note"});
		let end = contentEl.createEl('input', {type: "text", cls: 'journey-input-text'});
		contentEl.createEl("hr")
		let button = contentEl.createEl('input', {type: 'submit'});

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
		let {contentEl} = this;
		let message = "Results";
		contentEl.createEl("h2", {text: "Results"});
		if(this.results.length > 0) {

		}
		this.results.forEach(function(x) {
			contentEl.createDiv(x);
		});
	}
}
