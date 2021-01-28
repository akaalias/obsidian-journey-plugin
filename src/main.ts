import { App, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { Graph } from 'graphlib';
import * as graphlib from "graphlib";

export default class MyPlugin extends Plugin {
	async onload() {

		this.addStatusBarItem().setText('');

		this.addRibbonIcon('dot-network', 'Find Journey', () => {
			this.findShortestPath();
		});
	}

	onunload() {
	}

	private async findShortestPath() {
		// get md files
		let mdFiles = this.app.vault.getMarkdownFiles();

		var g = new Graph({ directed: true, compound: false, multigraph: true });

		console.log("Starting adding md files.")

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
		console.log("Finished adding md files.")

		console.log("Node count: " + g.nodeCount());
		console.log("Edge count: " + g.edgeCount());

		const startBasename = "Free Bouncing";
		const endBasename = "Obsidian Plugin Development"

		const searchResult = graphlib.alg.dijkstra(g, startBasename);

		console.log(searchResult[endBasename]);


		if(searchResult[endBasename].distance !== Infinity) {
			let finalList = new Array();
			let step = searchResult[endBasename];
			finalList.push(endBasename);

			while(step.distance != 0) {
				console.log("Looking at " + step.predecessor);
				finalList.push(step.predecessor);
				step = 	searchResult[step.predecessor];
			}

			console.log(finalList);

		} else {
			console.log("Could not find a path");
		}
	}
}
