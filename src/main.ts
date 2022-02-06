import { Console } from "console";
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

    this.addCommand({
        id: "flash-insert-flash",
        name: "Insert Flashcard",
        hotkeys: [{modifiers: ["Mod"], key: "F"}],
        editorCallback: async (editor) => {
          editor.replaceSelection(
            "```flash\n\n---\n\n```"
          )
          let cursor = editor.getCursor();
          editor.setCursor({
            line: cursor.line - 3 > 0 ? cursor.line - 3 : 0,
            ch: 0,
          });
        }
      })

      this.addCommand({
        id: "embed-in-cloze",
        name: "Embed in Cloze",
        hotkeys: [{modifiers: ["Mod"], key: "E"}],
        editorCallback: async (editor) => {
          let selectedText = editor.getSelection();
          editor.replaceSelection(
            `{:${selectedText}:}`
          );
          let cursor = editor.getCursor();
          editor.setCursor({
            line: cursor.line,
            ch: cursor.ch - 2 > 0 ? cursor.ch - 2 : 0,
          });
        }
      })

    this.registerMarkdownCodeBlockProcessor('flash', (source, el, ctx) => {
      let flash = new Flash(source);
      el.classList.add('flash-body');
      let cardFront = document.createElement('div');
      cardFront.classList.add('flash-card-front');
      let cardBack = document.createElement('div');
      cardBack.classList.add('flash-card-back');
      cardBack.classList.add('flash-card-invisible');
      let buttonContainer = document.createElement('div');
      buttonContainer.classList.add('flash-button-container');
      let button = document.createElement('button');
      button.classList.add('flash-card-button');
      // append button to button container
      buttonContainer.appendChild(button);
      // add the cards to el
      el.appendChild(cardFront);
      // add an hr 
      if (flash.getBack() !== "") {
        el.appendChild(cardBack);
      }
      el.appendChild(buttonContainer);
      button.innerText = 'Show Answer';
      // when the button is clicked, toggle the display of the back card
      button.addEventListener('click', () => {
        let spans = el.getElementsByClassName('flash-cloze') as HTMLCollectionOf<HTMLSpanElement>;
        if (!cardBack.classList.toggle('flash-card-invisible')) {
          button.innerText = "Hide Answer";
          for (let i = 0; i < spans.length; i ++) {
            spans[i].classList.remove('flash-cloze-hidden');
          }
        } else {
          button.innerText = "Show Answer";
          for (let i = 0; i < spans.length; i ++) {
            spans[i].classList.add('flash-cloze-hidden');
          }
        }
      });
      button.classList.add('flash-card-button');
      MarkdownRenderer.renderMarkdown(flash.getFront(), cardFront, ctx.sourcePath, null);
      if (flash.getBack() !== "") {
        MarkdownRenderer.renderMarkdown(flash.getBack(), cardBack, ctx.sourcePath, null);
      }
      
      let spans = el.getElementsByClassName('flash-cloze') as HTMLCollectionOf<HTMLSpanElement>;
      for (let i = 0; i < spans.length; i ++) {
        // add callback to span
        spans[i].addEventListener('click', () => {
          // toggle 'flash-cloze-hidden' class
          spans[i].classList.toggle('flash-cloze-hidden');
        });
      }
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
