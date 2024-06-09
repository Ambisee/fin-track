"use client"

import { forwardRef, Ref, useRef, useState } from "react"
import ReactQuill, { Quill } from "react-quill"
import 'react-quill/dist/quill.snow.css'

import FormTemplate, { CommonFieldProps } from "../FormTemplate"

import styles from "./Editor.module.css"


type EditorProps = CommonFieldProps & {
    getContents: (content: any) => void,
    setContents: (content: any) => void
}

const Editor = forwardRef<ReactQuill, EditorProps>(function Editor(props, ref) {
    return (
        <FormTemplate variant={props.variant}>
            <label className={styles["input-label"]}>Label</label>
            <div>
                <ReactQuill 
                    ref={ref}
                    theme="bubble"
                    className={`${styles["editor"]} ${props.className}`}
                />
            </div>
        </FormTemplate>
    )
})

export default Editor