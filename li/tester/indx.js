export const indx = {
    'li-icon': { title: 'Иконка', props: { name: 'refresh', fill: 'red', speed: 1, blink: 1, size: 128 } },
    'li-button': { title: 'Кнопка', props: { name: 'android', fill: 'green', width: 'auto', label: 'Test button', size: 64 } },
    'li-app': { title: 'li-app' },
    //'li-chart-apex': { title: 'li-chart-apex'},
    'li-editor-ace': { title: 'li-editor.ace', props: { theme: 'dracula', mode: 'javascript', src: 'console.log(this.properties) // description' } },
    'li-layout-app': { title: 'li-layout-app' },
    'li-table': {
        title: 'li-table', props: {
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
                    { title: "id", field: "id", width: 150, bottomCalc: "sum", hozAlign: "center" },
                    { title: "Name", field: "name", width: 150 },
                    { title: "Age", field: "age", hozAlign: "center", bottomCalc: "avg" },
                    { title: "Favourite Color", field: "col" },
                    { title: "Date Of Birth", field: "dob", sorter: "date", hozAlign: "center" },
                    { title: "Rating", field: "rating", formatter: "star" }
                ]
            }
        }
    },
    'li-tester': { title: 'li-tester' },
    'li-viewer-md': { title: 'li-viewer-md', props: { src: '/li/viewer-md/sample.md' } },
}