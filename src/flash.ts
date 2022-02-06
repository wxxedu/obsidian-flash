import {Marked} from '@ts-stack/markdown';

export class Flash {
    front: string;
    back: string;
    constructor(public source: string) {
        this.front = source.split("---")[0];
        this.back = source.split("---")[1];
        this.initMarked();
    }
    // init marked
    initMarked() {
        Marked.setOptions(
            {
                gfm: true,
                tables: true,
                sanitize: true,
            }
        )
        Marked.setBlockRule(/\$\$([\s\S]+?)\$\$/, (execArr): string => {
            return String.raw`\[` + execArr[1].replace("\{\{", "\{ \{").replace("\}\}", "\} \}") + String.raw`\]`;
        })
        Marked.setBlockRule(/\$([\s\S]+?)\$/, (execArr): string => {
            return String.raw`\(` + execArr[1].replace("\{\{", "\{ \{").replace("\}\}", "\} \}") + String.raw`\)`;
        })
    }

    public processCloze(text: string): string {
        // replaces all {:cloze:} with <span class="cloze">cloze</span>
        return text.replace(/\{:([\s\S]+?):\}/g, (match, p1) => {
            return `<span class="flash-cloze">${p1}</span>`;
        });
    }

    public getFront(): string {
        return this.processCloze(this.front);
    }

    public getBack(): string {
        return this.processCloze(this.back);
    }
}