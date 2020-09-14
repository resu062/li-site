let url = import.meta.url;
url = url.replace('/tester/indx.js', '');

export const indx = {

    'li-icon': { label: 'Иконка', props: { name: 'refresh', fill: 'red', speed: 1, blink: 1, size: 128 } },
    icon: [{ label: 'index', url: url + '/icon' }],

    'li-icons': { label: 'Иконки' },
    icons: [{ label: 'index', url: url + '/icons' }],

    'li-checkbox': { label: 'Checkbox', props: { size: 48, fill: 'green'} },
    checkbox: [{ label: 'index', url: url + '/checkbox' }],

    'li-button': { label: 'Кнопка', props: { name: 'android', fill: 'green', width: 'auto', label: 'Test button', size: 64 } },
    button: [{ label: 'index', url: url + '/button' }, { label: 'index-2', url: url + '/button/index-2.html' }],

    'li-table': {
        label: 'li-table', props: {
            options: {
                maxHeight: "99%",
                minHeight: 400,
                height: "100%",
                layout: "fitColumns",
                data: [
                    { id: 1, name: "Oli Bob", age: 12, col: "red", dob: "", rating: 2 },
                    { id: 2, name: "Mary May", age: 13, col: "blue", dob: "14/05/1982", rating: 0 },
                    { id: 3, name: "Christine Lobowski", age: 42, col: "green", dob: "22/05/1982", rating: 4 },
                    { id: 4, name: "Brendon Philips", age: 81, col: "orange", dob: "01/08/1980", rating: 5 },
                    { id: 5, name: "Margret Marmajuke", age: 16, col: "yellow", dob: "31/01/1999", rating: 3 },
                    { id: 6, name: "Oli Bob", age: 27, col: "red", dob: "", rating: 1 },
                    { id: 7, name: "Mary May", age: 31, col: "blue", dob: "14/05/1982", rating: 4 },
                    { id: 8, name: "Christine Lobowski", age: 57, col: "green", dob: "22/05/1982", rating: 2 },
                    { id: 9, name: "Brendon Philips", age: 63, col: "orange", dob: "01/08/1980", rating: 4 },
                    { id: 10, name: "Margret Marmajuke", age: 99, col: "yellow", dob: "31/01/1999", rating: 5 },
                ],
                columns: [
                    { label: "id", field: "id", width: 150, bottomCalc: "sum", hozAlign: "center" },
                    { label: "Name", field: "name", width: 150 },
                    { label: "Age", field: "age", hozAlign: "center", bottomCalc: "avg" },
                    { label: "Favourite Color", field: "col" },
                    { label: "Date Of Birth", field: "dob", sorter: "date", hozAlign: "center" },
                    { label: "Rating", field: "rating", formatter: "star" }
                ]
            }
        }
    },
    table: [{ label: 'index', url: url + '/table' }],

    'li-layout-tree': {
        label: 'li-layout-tree', props: {
            allowCheck: true,
            item: [
                { label: 1 },
                { label: 2, items: [{ label: '2.1' }, { label: '2.2' }] },
                { label: 3 },
                { label: 4 },
                { label: 5 },
                { label: 6 },
                { label: 7 },
                { label: 8 },
                { label: 9 },
                { label: 10 },
                { label: 11 },
                { label: 12, items: [{ label: '16' }, { label: '17' }, { label: '161' }, { label: '171' }, { label: '162' }, { label: '172' }] },
                { label: 13 },
                {
                    label: 14, items: [{ label: '14.1' }, {
                        label: '14.2', items: [
                            {
                                label: '14.2.1',
                                items: [
                                    { label: 2, items: [{ label: '2.1' }, { label: '2.2' }] },
                                    { label: 12, items: [{ label: '16' }, { label: '17' }] },
                                    { label: 13 },
                                    { label: 14, items: [{ label: '14.1' }, { label: '14.2', items: [{ label: '14.2.1' }] }] },
                                    { label: 15 },
                                ]
                            }]
                    }]
                },
                { label: 15 },
                { label: 16 },
                { label: 17 },
                { label: 18 },
                { label: 19 },
                { label: 20 },
            ]
        }
    },
    tree: [{ label: 'index', url: url + '/tree' }],

    'li-layout-designer': {
        label: 'li-layout-designer', props: {
            keyLabel: 'name',
            keyItems: 'fields',
            id: 'layout',
            item: {
                fields: [
                    { name: 1 },
                    { name: 2, fields: [{ name: '2.1' }, { name: '2.2' }, { name: '2.3' }, { name: '2.4' }, { name: '2.5' }, { name: '2.6' }] },
                    { name: 3 },
                    { name: 4 },
                    { name: 5 },
                    { name: 6 },
                    { name: 7 },
                    { name: 8 },
                    { name: 9 },
                    { name: 10 },
                    { name: 11 },
                    { name: 12, fields: [{ name: '12.1' }, { name: '12.2' }, { name: '12.3' }, { name: '12.4' }, { name: '12.5' }, { name: '12.6' }] },
                    { name: 13 },
                    {
                        name: 14, fields: [
                            { name: '14.1' },
                            {
                                name: '14.2', fields: [
                                    {
                                        name: '14.2.1',
                                        fields: [
                                            { name: '14.2.1.1', fields: [{ name: '14.2.1.1.1' }, { name: '14.2.1.1.2' }] },
                                            { name: '14.2.1.2', fields: [{ name: '14.2.1.2.1' }, { name: '14.2.1.2.2' }] },
                                            { name: '14.2.1.3' },
                                            { name: '14.2.1.4', fields: [{ name: '14.2.1.4.1' }, { name: '14.2.1.4.2', fields: [{ name: '14.2.1.4.2.1' }, { name: '14.2.1.4.2.2' }, { name: '14.2.1.4.2.3' }, { name: '14.2.1.4.2.4' }] }] },
                                            { name: '14.2.1.5' },
                                        ]
                                    },
                                    { name: '14.2.2' },
                                    { name: '14.2.3' },
                                    { name: '14.2.4' },
                                    { name: '14.2.5' }],

                            },
                            { name: '14.3' },
                            { name: '14.4' },
                            { name: '14.5' },],
                    },
                    { name: 15 },
                    { name: 16 },
                    { name: 17 },
                    { name: 18 },
                    { name: 19 },
                    { name: 20 },
                ]
            }
        }
    },
    'layout-designer': [{ label: 'index', url: url + '/layout-designer' }],

    'li-layout-app': { label: 'li-layout-app' },
    'layout-app': [{ label: 'index', url: url + '/layout-app' }, { label: 'demo', url: url + '/layout-app/demo.html' }, { label: 'demo2', url: url + '/layout-app/demo2.html' }],

    'li-editor-ace': { label: 'li-editor-ace', props: { theme: 'dracula', mode: 'javascript', src: 'console.log(this.properties) // description' } },
    'editor-ace': [{ label: 'index', url: url + '/editor-ace' }],

    'li-viewer-md': { label: 'li-viewer-md', props: { src: url + '/viewer-md/sample.md' } },
    'viewer-md': [{ label: 'index', url: url + '/viewer-md' }],

    'li-tester': { label: 'li-tester' },
    tester: [{ label: 'index', url: url + '/tester' }, { label: 'index2', url: url + '/tester/index-2.html' }],

    'li-app': { label: 'li-app' },
    app: [{ label: 'index', url: url + '/app' }],
}