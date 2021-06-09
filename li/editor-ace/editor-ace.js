import { LiElement, html } from '../../li.js';

import './src/ace.js'
let url = import.meta.url;

customElements.define('li-editor-ace', class LiAceEditor extends LiElement {
    static get properties() {
        return {
            src: { type: String, default: '' },
            mode: {
                type: String,
                default: 'javascript',
                list: [
                    'abap', 'abc', 'actionscript', 'ada', 'apache_conf', 'apex', 'applescript', 'aql', 'asciidoc', 'asl', 'assembly_x86',
                    'autohotkey', 'batchfile', 'bro', 'c9search', 'cirru', 'clojure', 'cobol', 'coffee', 'coldfusion',
                    'crystal', 'csharp', 'csound_document', 'csound_orchestra', 'csound_scope', 'csp', 'css', 'curly',
                    'c_cpp', 'd', 'dart', 'diff', 'django', 'dockerfile', 'dot', 'drools', 'edifact',
                    'eiffel', 'ejs', 'elixir', 'elm', 'erlang', 'forth', 'fortran', 'fsl', 'ftl', 'gcode', 'gherkin', 'gitignore',
                    'glsl', 'gobstones', 'golang', 'graphqlschema', 'groovy', 'haml', 'handlebars', 'haskell', 'haskell_cabal', 'haxe',
                    'hjson', 'html', 'html_elixir', 'html_ruby', 'ini', 'io', 'jack', 'jade', 'java', 'javascript', 'json', 'json5',
                    'jsoniq', 'jsp', 'jssm', 'jsx', 'julia', 'kotlin', 'latex', 'less', 'liquid', 'lisp', 'livescript', 'logtalk',
                    'live_script', 'logiql', 'lsl', 'lua', 'luapage', 'lucene', 'makefile', 'markdown', 'mask', 'matlab',
                    'maze', 'mel', 'mixal', 'mushcode', 'mysql', 'nix', 'nsis', 'objectivec', 'ocaml', 'pascal',
                    'perl', 'perl6', 'pgsql', 'php', 'php_laravel_blade', 'pig', 'plain_text', 'powershell', 'praat', 'prolog', 'properties',
                    'protobuf', 'puppet', 'python', 'r', 'razor', 'rdoc', 'red', 'redshift', 'rhtml', 'rst', 'ruby', 'rust', 'sass', 'scad', 'scala',
                    'scheme', 'scss', 'sh', 'sjs', 'slim', 'smarty', 'snippets', 'soy_template', 'space', 'sparql', 'sql', 'sqlserver',
                    'stylus', 'svg', 'swift', 'swig', 'tcl', 'tex', 'text', 'textile', 'toml', 'tsx', 'turtle', 'twig', 'typescript',
                    'vala', 'vbscript', 'velocity', 'verilog', 'vhdl', 'visualforce', 'wollok', 'xml', 'xquery', 'yaml', 'zeek'
                ]
            }, 
            theme: {
                type: String,
                default: 'solarized_light',
                list: ['ambiance', 'chaos', 'chrome', 'clouds', 'clouds_midnight', 'cobalt', 'crimson_editor', 'dawn', 'dracula',
                    'dreamweaver', 'eclipse', 'github', 'gob', 'gruvbox', 'idle_fingers', 'iplastic', 'katzenmilch', 'kr_theme', 'kuroir',
                    'merbivore', 'merbivore_soft', 'monokai', 'mono_industrial', 'pastel_on_dark', 'solarized_dark',
                    'solarized_light', 'sqlserver', 'terminal', 'textmate', 'tomorrow', 'tomorrow_night', 'tomorrow_night_blue',
                    'tomorrow_night_bright', 'tomorrow_night_eighties', 'twilight', 'vibrant_ink', 'xcode'
                ]
            },
            options: {
                type: Object,
                default: {
                    mode: 'ace/mode/javascript',
                    theme: 'ace/theme/solarized_light',
                    highlightActiveLine: true,
                    highlightSelectedWord: true,
                    readOnly: false,
                    cursorStyle: 'slim', // "ace" | "slim" | "smooth" | "wide"
                    //mergeUndoDeltas: false | true | "always"
                    //behavioursEnabled: boolean,
                    //wrapBehavioursEnabled: boolean,
                    autoScrollEditorIntoView: true,
                    copyWithEmptySelection: false,
                    useSoftTabs: false,
                    navigateWithinSoftTabs: false,
                    enableMultiselect: true,
                    hScrollBarAlwaysVisible: false,
                    vScrollBarAlwaysVisible: false,
                    highlightGutterLine: false,
                    animatedScroll: true,
                    showInvisibles: false,
                    showPrintMargin: true,
                    printMarginColumn: 80,
                    //printMargin: false | number
                    fadeFoldWidgets: false,
                    showFoldWidgets: true,
                    showLineNumbers: true,
                    showGutter: true,
                    displayIndentGuides: true,
                    fontSize: 12,
                    //fontFamily: css font-family value
                    maxLines: Infinity,
                    minLines: 3,
                    //scrollPastEnd: number | boolean // number of page sizes to scroll after document end (typical values are 0, 0.5, and 1)
                    fixedWidthGutter: false,
                    firstLineNumber: 1,
                    //overwrite: boolean,
                    //newLineMode: "auto" | "unix" | "windows"
                    useWorker: false,
                    //useSoftTabs: boolean,
                    //tabSize: number,
                    wrap: true,
                    foldStyle: 'markbeginend' //"markbegin" | "markbeginend" | "manual",
                }
            }
        }
    }

    render() {
        return html`
            <style>
                #host {
                    width:100%;
                }
                #editor {
                    height: 400px;
                }
            </style>
            <div id="host">
                <div id="editor"></div>
            </div>
        `
    }

    firstUpdated() {
        super.firstUpdated();
        this._update();
    }

    _update() {
        let ed = this.shadowRoot.getElementById('editor');
        ace.config.set('basePath', url.replace('editor-ace.js', 'src/'));
        this.editor = ace.edit(ed, { autoScrollEditorIntoView: true });
        this.editor.setTheme('ace/theme/' + this.theme);
        this.editor.getSession().setMode('ace/mode/' + this.mode);
        this.editor.setValue(this.src, -1);
        this.editor.renderer.attachToShadowRoot();
        this.editor.setOptions({ maxLines: 40, minLines: 40, fontSize: 20 });
        this.editor.session.selection.clearSelection();
        this.$update();
    }
})
