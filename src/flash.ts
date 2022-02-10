import {Marked} from '@ts-stack/markdown';
import { v4 as uuidv4 } from 'uuid';

export class Flash {
    front: string;
    back: string;
    constructor(public source: string) {
        let fandb = source.split('\n---\n');
        this.front = fandb[0];
        if (fandb.length > 1) {
            this.back = fandb[1].trim();
        } else {
            this.back = "";
        }
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
            // create a span with the class "flash-cloze"
            let span = document.createElement('span');
            span.classList.add('flash-cloze');
            span.classList.add('flash-cloze-hidden');
            // add the cloze text to the span
            span.innerText = p1;
            span.id = uuidv4();
            return span.outerHTML;
        });
    }

    public getFront(): string {
        return this.processCloze(this.front);
    }

    public getBack(): string {
        return this.processCloze(this.back);
    }
}