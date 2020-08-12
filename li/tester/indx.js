let url = import.meta.url;
url = url.replace('tester/indx.js', 'viewer-md/sample.md');

export const indx = {

    'li-icon': { label: 'Иконка', props: { name: 'refresh', fill: 'red', speed: 1, blink: 1, size: 128 } },
    icon: [{ label: 'index', url: '/li/icon' }],
    

    'li-icons': { label: 'Иконки' },
    icons: [{ label: 'index', url: '/li/icons' }],
    

    'li-button': { label: 'Кнопка', props: { name: 'android', fill: 'green', width: 'auto', label: 'Test button', size: 64 } },
    button: [{ label: 'index', url: '/li/button' }, { label: 'index-2', url: '/li/button/index-2.html' }],
    

    'li-app': { label: 'li-app' },
    app: [{ label: 'index', url: '/li/app' }],
    

    'li-editor-ace': { label: 'li-editor-ace', props: { theme: 'dracula', mode: 'javascript', src: 'console.log(this.properties) // description' } },
    'editor-ace': [{ label: 'index', url: '/li/editor-ace' }],
    

    'li-layout-app': { label: 'li-layout-app' },
    'layout-app': [{ label: 'index', url: '/li/layout-app' }, { label: 'demo', url: '/li/layout-app/demo.html' }, { label: 'demo2', url: '/li/layout-app/demo2.html' }],
    

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
    table: [{ label: 'index', url: '/li/table' }],


    'li-tester': { label: 'li-tester' },
    tester: [{ label: 'index', url: '/li/tester' }, { label: 'index2', url: '/li/tester/index-2.html' }],
    

    'li-viewer-md': { label: 'li-viewer-md', props: { src: url } },
    'viewer-md': [{ label: 'index', url: '/li/viewer-md' }],
    
}