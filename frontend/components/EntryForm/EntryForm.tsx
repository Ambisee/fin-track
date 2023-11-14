"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"

import CurrencyField from "../FormField/CurrencyField/CurrencyField"
import TextField from "../FormField/TextField/TextField"
import BaseFormWrapper from "../BaseFormWrapper/BaseFormWrapper"
import ActionButton from "../ActionButton/ActionButton"
import DateField from "../FormField/DateField/DateField"
import { sbClient } from "@/supabase/supabase_client"
import { DashboardDataContextObject, useDashboardData } from "../DashboardDataProvider/DashboardDataProvider"

import styles from "./EntryForm.module.css"

interface EntryFormProps {
    title?: string,
}

export default function EntryForm(props: EntryFormProps) {
    const { register, watch, handleSubmit, setValue, formState: { errors } } = useForm()
    const [sign, setSign] = useState(true)
    const { user } = useDashboardData() as DashboardDataContextObject

    const clearField = () => {
        setValue("date", "")
        setValue("description", "")
        setValue("amount", "")
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
        <BaseFormWrapper
            title={props.title}
        >
            <form 
                className={styles["form-element"]}
                onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit(
                        async (data) => {
                            if (user === null) {
                                return {value: {error: "No signed in user."}}
                            }
                            
                            sbClient.from("entry").insert({
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
                        },
                        (errors) => {
                            let errMessage = ""
                            for (const key in errors) {
                                errMessage += `- ${errors[key]?.message}\n`
                            }
                            alert(errMessage)
                        }
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
                            watchedValue={!isNaN(watch("date"))}
                        />
                    </div>
                    <div className={styles["field-wrapper"]}>
                        <TextField
                            variant="outlined"
                            className={styles["input-field"]}
                            registerObject={descRegisterObject}
                            watchedValue={watch("description")}
                            fieldDisplayName="Description"
                        />
                    </div>
                    <div className={styles["field-wrapper"]}>
                        <CurrencyField 
                            variant="outlined"
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
                        onClick={clearField}
                    >
                        Clear
                    </ActionButton>
                </div>
            </form>
        </BaseFormWrapper>
    )
}