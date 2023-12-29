"use client"

import { useState, KeyboardEvent, KeyboardEventHandler, HTMLProps, useEffect } from "react"
import { FieldErrors, FieldValues, useForm } from "react-hook-form"

import CurrencyField from "../FormField/CurrencyField/CurrencyField"
import TextField from "../FormField/TextField/TextField"
import BaseFormWrapper from "../BaseFormWrapper/BaseFormWrapper"
import ActionButton from "../ActionButton/ActionButton"
import DateField from "../FormField/DateField/DateField"
import { sbClient } from "@/supabase/supabase_client"
import { DashboardDataContextObject, useDashboardData } from "../DashboardDataProvider/DashboardDataProvider"

import styles from "./EntryForm.module.css"
import { Entry } from "@/supabase"
import { User } from "@supabase/supabase-js"
import { useLayout } from "../ProtectedLayoutProvider/ProtectedLayoutProvider"

type EntryFormType =  {type?: "NEW_ENTRY"} | {type?: "EDIT_ENTRY", values?: Entry}
type EntryFormProps = Pick<HTMLProps<HTMLFormElement>, "id"> & EntryFormType & {
    values?: unknown,
    title?: string
}

const updateSupabaseEntry = async (data: FieldValues, id: number, sign: boolean, user: User) => {
    if (user === null) {
        alert("No signed in user.")
        return
    }

    return sbClient.from("entry")
        .update({
            date: data.date,
            description: data.description,
            amount: data.amount,
            amount_is_positive: !sign
        })
        .eq("id", id)
        .then((value) => {
            if (value.error) {
                alert(value.error.message)
                return
            }
    
            alert("Sucessfully made the change to the entry.")
        })
}

const insertSupabaseEntry = async (data: FieldValues, sign: boolean, user: User) => {
    if (user === null) {
        alert("No signed in user.")
        return
    }
    
    return sbClient.from("entry").insert({
        date: data.date,
        description: data.description,
        amount: data.amount,
        amount_is_positive: !sign,
        created_by: user.id
    }).then((value) => {
        if (value.error) {
            alert(value.error.message)
            return
        }

        alert("Sucessfully added the new entry.")
    })
}

const handleError = (errors: FieldErrors<FieldValues>) => {
    let errMessage = ""
    for (const key in errors) {
        errMessage += `- ${errors[key]?.message}\n`
    }
    alert(errMessage)
}

export default function EntryForm(props: EntryFormProps) {
    const [sign, setSign] = useState(props.type === "EDIT_ENTRY" && props.values !== undefined ? !props.values.amount_is_positive : true)
    const { user } = useDashboardData() as DashboardDataContextObject
    const { register, watch, handleSubmit, setValue, formState: { errors } } = useForm()

    useEffect(() => {
        if (props.type === "EDIT_ENTRY" && props.values !== undefined) {
            setValue("date", props.values.date)
            setValue("description", props.values.description)
            setValue("amount", (props.values.amount as string).slice(1))
        }
    }, [props.type, props.values, setValue])

    const clearFields = () => {
        setValue("date", "")
        setValue("description", "")
        setValue("amount", "")
    }

    const resetFields = () => {
        if (props.type !== "EDIT_ENTRY") {
            return
        }

        if (props.values === undefined) {
            return
        }

        setValue("date", props.values.date)
        setValue("description", props.values.description)
        setValue("amount", (props.values.amount as string).slice(1))
        setSign(!props.values.amount_is_positive)
    }

    const dateRegisterObject = register("date", {
        required: "Please enter a date value.",
        valueAsDate: true,
    })

    const descRegisterObject = register("description")
    const amountRegisterObject = register("amount", {
        required: "Please enter an amount.",
        pattern: {
            value: /^([1-9]\d{0,2}(,\d{3})*|\d+)(\.\d{2})?$/,
            message: "Please enter a valid currency value. (e.g. 12.10, 0.12, 1,000.50)."
        }
    })

    return (
        <BaseFormWrapper title={props.title}>
            <form
                id={props.id}
                className={styles["form-element"]}
                onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit(
                        (data) => {
                            if (user === null) {
                                alert("No user signed in")
                                return
                            }

                            if (props.type === "NEW_ENTRY") {
                                insertSupabaseEntry(data, sign, user)
                                    .then(() => {
                                        clearFields()
                                    })
                            }
                            else if (props.type === "EDIT_ENTRY" && props.values !== undefined) {
                                updateSupabaseEntry(data, props.values.id, sign, user)
                            }
                        },
                        (errors) => handleError(errors)
                    )(e)
                }}
            >
                <div className={styles["field-container"]}>
                    <div className={styles["field-wrapper"]}>
                        <DateField 
                            variant="outlined"
                            className={styles["input-field"]}
                            fieldDisplayName="Date"
                            registerObject={dateRegisterObject}
                            setValue={(val: string) => setValue("date", val)}
                            watchedValue={!isNaN(watch("date"))}
                        />
                    </div>
                    <div className={styles["field-wrapper"]}>
                        <TextField
                            variant="outlined"
                            autoComplete="off"
                            className={styles["input-field"]}
                            registerObject={descRegisterObject}
                            watchedValue={watch("description")}
                            fieldDisplayName="Description"
                        />
                    </div>
                    <div className={styles["field-wrapper"]}>
                        <CurrencyField 
                            variant="outlined"
                            autoComplete="off"
                            className={styles["input-field"]}
                            registerObject={amountRegisterObject}
                            watchedValue={watch("amount")}
                            sign={sign}
                            toggleSign={() => setSign(current => !current)}
                            fieldDisplayName="Amount"
                        />
                    </div>
                </div>
                <div className={styles["button-container"]}>
                    <ActionButton 
                        className={`${styles["submit-button"]} ${styles["form-button"]}`}
                    >
                        Submit
                    </ActionButton>
                    <ActionButton 
                        className={`${styles["clear-button"]} ${styles["form-button"]}`}
                        type="button"
                        onClick={(e) => {
                            if (props.type === "NEW_ENTRY") {
                                clearFields()
                                return
                            }
                            if (props.type === "EDIT_ENTRY") {
                                resetFields()
                                return
                            }
                        }}
                    >
                        {props.type === "EDIT_ENTRY" ? "Reset" : "Clear"}
                    </ActionButton>
                </div>
            </form>
        </BaseFormWrapper>
    )
}