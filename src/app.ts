import * as m from 'mithril';

interface SelectedFile {
    file: File,
    hasRemoved: boolean
}

interface Result {
    status: string,
    numberOfuploadedFiles: number
}

let postUrl:string;

function DropZoneComponent(): m.Component<{handleDrop:(event) => void, handleDragover:(event) => void, handleInput:(event) => void}> {
    return {
        view(vnode) {
            return m("div", 
                {
                    id: "dropzone", 
                    class: "h-50 rounded mb-5",
                    style: "border-style:dashed;border-width: 2px;",
                    ondrop: (event) => {
                        vnode.attrs.handleDrop(event);
                    },
                    ondragover: (event) => {
                        vnode.attrs.handleDragover(event);
                    }
                }, 
                [
                    m("div.row", {class: "align-items-end h-50"} ,
                        m("div.col", {class: "text-center text-muted"}, 
                            m("h5.mb-2", "Drop Files Here")
                        )
                    ),
                    m("div.row", {class: "align-items-top h-50"} ,
                        m("div.col", {class: "text-center"}, [
                                m("label.text-muted.mr-2", "or"),
                                m("label", { for: "btn-file-input" }, 
                                    m("span", {class: "btn btn-sm btn-outline-primary"}, "Browse")
                                ),
                                m("input", 
                                    {
                                        id: "btn-file-input",
                                        style: "display: none;",
                                        type: "file", 
                                        multiple: "multiple",
                                        onchange: (event) => {
                                            vnode.attrs.handleInput(event);
                                        }
                                    }
                                )
                            ]
                        )
                    )
                ]
            )
        }
    }
}

function SelectedFileComponent(): m.Component<{fileSelection: SelectedFile, onRemove:()=>void}> {
    let stateFileSelection: SelectedFile;
    return {
        oninit(vnode) {
            stateFileSelection = vnode.attrs.fileSelection;
        },

        view(vnode) {
            return [
                m("div.row.mt-2",
                    [
                        m("div.col", m("h6", stateFileSelection.file.name)),
                        m("div.col", {class: "text-danger text-right"}, 
                            m("i", 
                                {
                                    class: "fas fa-times ml-5",
                                    onclick: () => {
                                        vnode.attrs.onRemove();
                                    }
                                }
                            )
                        )
                    ]
                )
            ]
        }
    }
}

function MainComponent(): m.Component<{}> {
    let selectedFileArray: SelectedFile[];
    let numberOfRemovedFiles: number;
    let showSuccessAlert: boolean;
    let showErrorAlert: boolean;
    let formData: FormData;
    let isFirstToShow: boolean;

    let updateSelectedFileArray: (fileList: FileList) => void;

    let restartStateVariables: () => void;

    return {
        oninit(vnode) {
            selectedFileArray = [];
            formData = new FormData();
            numberOfRemovedFiles = 0;
            showSuccessAlert = false;
            showErrorAlert = false;
            isFirstToShow = true;

            updateSelectedFileArray = (fileList: FileList) => {
                for (var i = 0; i < fileList.length; i++) {
                    let selectedFile = {
                        file: fileList[i],
                        hasRemoved: false
                    }
                    selectedFileArray.push(selectedFile);
                }
                isFirstToShow = true;
            }

            restartStateVariables = () => {
                formData = new FormData();
                selectedFileArray = [];
                numberOfRemovedFiles = 0;
                isFirstToShow = true;
            }

        },

        view(vnode) {
            return m("div", {style: "height:400px;"},
                [
                    (showSuccessAlert)? m("div", {class: "alert alert-success"}, "All files are uploaded successfully."): console.log("Not showing success: ", showSuccessAlert),
                    (showErrorAlert)? m("div", {class: "alert alert-warning"}, "Some files are uploaded successfully but some are fail to upload."): console.log("Not showing error: ", showErrorAlert),

                    m(DropZoneComponent, 
                        {
                            handleDrop : (event) => {
                                event.preventDefault();
                                console.log("drop", event);

                                updateSelectedFileArray(event.dataTransfer.files);
                            },

                            handleDragover : (event) => {
                                event.preventDefault();
                                console.log("dragover", event);
                                event.dataTransfer.dropEffect = "copy";
                            },

                            handleInput : (event) => {
                                event.preventDefault();
                                console.log("input", event.target.files.length);

                                updateSelectedFileArray(event.target.files);
                            }
                        }, vnode
                    ),
                    selectedFileArray.map
                    ( (selectedFile, index) => 
                        (selectedFile.hasRemoved) 
                        ? console.log(selectedFile.file.name + " has been removed.")
                        :
                        [
                            (index > 0) 
                            ?
                                (isFirstToShow)? isFirstToShow = false : m("hr")
                            :
                                isFirstToShow = false,
                            m(SelectedFileComponent, 
                                {
                                    fileSelection: selectedFile,
                                    onRemove: () => {
                                        selectedFile.hasRemoved = true;
                                        numberOfRemovedFiles++;
                                        isFirstToShow = true;
                                        console.log("Number of removed files : ", numberOfRemovedFiles);
                                        if(numberOfRemovedFiles == selectedFileArray.length) {
                                            selectedFileArray = [];
                                            numberOfRemovedFiles = 0;
                                        }
                                    }
                                }
                            )
                        ]
                    ),
                    (selectedFileArray.length > numberOfRemovedFiles)
                    ? 
                    m("div", {class: "mt-3 mb-3"},
                        [
                            m("button", 
                                {
                                    class: "btn btn-primary",
                                    onclick: () => {
                                        for (var i = 0; i < selectedFileArray.length; i++) {
                                            if(!selectedFileArray[i].hasRemoved) {
                                                formData.append("selectedFiles", selectedFileArray[i].file);
                                            }
                                        }

                                        console.log("Post url : " + postUrl);
                                        m.request({
                                            method: "POST",
                                            body: formData,
                                            url: "/"+postUrl
                                        })
                                        .then(function (result:Result) {
                                            if(result.status == "success") {
                                                showSuccessAlert = true;
                                                showErrorAlert = false;
                                            }
                                            else if(result.status == "fail") {
                                                showErrorAlert = true;
                                                showSuccessAlert = false;
                                            }
                                            console.log("Result : ", result)
                                            console.log(formData.getAll("selectedFiles"));
                                            restartStateVariables();
                                        })
                                    }
                                }, "Save Files"),
                            m("button", 
                                {
                                    class: "btn btn-outline-primary ml-1",
                                    onclick: () => {
                                        showSuccessAlert = false;
                                        showErrorAlert = false;
                                        restartStateVariables();
                                    }
                                }, "Cancel"
                            ) 
                        ]
                    )
                    :
                    console.log("Empty List!")
                ]
            )
        }
    }
}

let divElem = document.getElementById("app");
if(divElem != null) {
    let dataUrl = divElem.getAttribute("data-url");
    if(dataUrl != null) {
        postUrl = dataUrl;
    }
    //m.render(divElem, "Hello World");
    m.mount(divElem, MainComponent);
}