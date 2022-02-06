import { App, Plugin, PluginSettingTab, Setting, MarkdownRenderer } from "obsidian";
import { Flash } from "./flash";

export default class MyPlugin extends Plugin {
  // This field stores your plugin settings.
  setting: MyPluginSettings;

  onInit() {}

  async onload() {
    console.log("Loading Obsidian Renderer...");

    // This snippet of code is used to load pluging settings from disk (if any)
    // and then add the setting tab in the Obsidian Settings panel.
    // If your plugin does not use settings, you can delete these two lines.
    this.setting = (await this.loadData()) || {
      someConfigData: 1,
      anotherConfigData: "defaultValue",
    };

    this.registerMarkdownCodeBlockProcessor('flash', (source, el, ctx) => {
      el.classList.add('flash-body');
      let cardFront = document.createElement('div');
      cardFront.classList.add('flash-card-front');
      let cardBack = document.createElement('div');
      cardBack.classList.add('flash-card-back');
      cardBack.classList.add('flash-card-invisible');
      let buttonContainer = document.createElement('div');
      buttonContainer.classList.add('flash-button-container');
      // center align button container
      buttonContainer.style.textAlign = 'center';
      let button = document.createElement('button');
      button.classList.add('flash-card-button');
      // append button to button container
      buttonContainer.appendChild(button);
      // add the cards to el
      el.appendChild(cardFront);
      // add an hr 
      el.appendChild(cardBack);
      el.appendChild(buttonContainer);
      button.innerText = 'Show Answer';
      // when the button is clicked, toggle the display of the back card
      button.addEventListener('click', () => {
        if (!cardBack.classList.toggle('flash-card-invisible')) {
          button.innerText = "Hide Answer";
        } else {
          button.innerText = "Show Answer";
        }
      });
      button.classList.add('flash-card-button');
      // center align the button
      button.style.textAlign = 'center';
      let flash = new Flash(source);
      MarkdownRenderer.renderMarkdown(flash.getFront(), cardFront, ctx.sourcePath, null);
      MarkdownRenderer.renderMarkdown(flash.getBack(), cardBack, ctx.sourcePath, null);
    });
    this.addSettingTab(new MyPluginSettingsTab(this.app, this));
  }

  onunload() {
    console.log("Plugin is Unloading...");
  }
}

/**
 * This is a data class that contains your plugin configurations. You can edit it
 * as you wish by adding fields and all the data you need.
 */
interface MyPluginSettings {
  someConfigData: number;
  anotherConfigData: string;
}

class MyPluginSettingsTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const settings = this.plugin.setting;
    // This is just an example of a setting controll.
    new Setting(containerEl)
      .setName("Setting Name")
      .setDesc("Setting description")
      .addText((text) =>
        text.setValue(String(settings.someConfigData)).onChange((value) => {
          if (!isNaN(Number(value))) {
            settings.someConfigData = Number(value);
            this.plugin.saveData(settings);
          }
        })
      );
  }
}
