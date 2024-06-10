"use client"

import dynamic from "next/dynamic"
import { forwardRef, Ref, useState } from "react"
import ReactQuill, { ReactQuillProps } from "react-quill"

import FormTemplate, { CommonFieldProps } from "../FormTemplate"

import styles from "./Editor.module.css"
import 'react-quill/dist/quill.bubble.css'
import './custom-quill.css'


type EditorProps = CommonFieldProps

const DynamicReactQuill = dynamic(async () => {
    const { default: RQ } = await import("react-quill")
    return function Comp({forwardedRef, ...props}: ReactQuillProps & {forwardedRef: Ref<ReactQuill>}) {return <RQ ref={forwardedRef} {...props} />}
}, {
    ssr: false
})

const toolbarOptions = [
    ['bold', 'italic', 'underline'],
    [{'indent': '+1'}, {'indent': '-1'}],
    [{'list': 'bullet'}]
]

const Editor = forwardRef<ReactQuill, EditorProps>(function Editor(props, ref) {
    const [isFilled, setIsFilled] = useState(false)

    return (
        <FormTemplate variant={props.variant}>
            <div className={styles["field-container"]}>
                <DynamicReactQuill
                    forwardedRef={ref}
                    modules={{toolbar: toolbarOptions}}
                    theme="bubble"
                    className={`${styles["editor"]} ${isFilled && styles["filled"]} ${props.className}`}
                    onChange={(value, delta, source, editor) => {
                        setIsFilled(editor.getText().trim() !== "")
                    }}
                />
                <label className={styles["input-label"]}>{props.fieldDisplayName}</label>
            </div>
        </FormTemplate>
    )
})

export default Editor