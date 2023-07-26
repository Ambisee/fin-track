import Head from "next/head"
import { useState, useEffect } from "react"

import DashboardLayout from "../../components/dashboard_page/DashboardLayout/DashboardLayout"
import DashboardTable from "../../components/dashboard_page/DashboardTable/DashboardTable"
import { INFO, ERROR } from '../../components/common/MessageIndicator/constants'
import { useAuth } from "../../firebase/auth"
import { useFirestore } from "../../firebase/firestore"
import { sortData } from "../../components/dashboard_page/records_page/helper"
import { flashMessage } from "../../components/common/helper"
import { useDashboardContext } from "../../components/dashboard_page/context"
import { EntryData } from "../../firebase/types"

import styles from '../../public/css/dashboard/records.module.css'

const tableConfig = {    
    headers: ["detail", "amount"],
    columnWidths: [
        { width: "50%", minWidth: "20rem" },
        { width: "30%", minWidth: "9.5rem" },
        { width: "10%", minWidth: "3rem" }
    ]
}

export default function DashboardRecordsPage() {
    const auth = useAuth()
    const firestore = useFirestore()
    const [tableData, setTableData] = useState<([string, (EntryData & {id: string})[]])[]>([])
    const { dispatch } = useDashboardContext()
    
    useEffect(() => {
        setTableData(current => {
            const newData = Object.entries(sortData(firestore.entryData))
            return newData
        })

    }, [firestore.entryData])

    return (
        <div>
            <Head>
                <title>{`${process.env.NEXT_PUBLIC_TITLE} | Dashboard | Records`}</title>
            </Head>
            <div className={styles.recordsTables}>
                {tableData.map((value) => 
                    (
                        <div>
                            <h4>{value[0]}</h4>
                            <DashboardTable 
                                config={tableConfig}
                                data={value[1]}
                                className={styles.entryTable}
                                deleteRowCallback={(id) => {
                                    flashMessage(dispatch, "Loading...", INFO)
                        
                                    firestore.deleteEntry(
                                        id, 
                                        () => flashMessage(dispatch, "Entry deleted", INFO, 2000),
                                        (error) => flashMessage(dispatch, `An unknown error occured: ${error}`, ERROR, 2000),
                                    )
                                }}
                            />
                        </div>
                    )
                )}
            </div>
        </div>
    )
}

DashboardRecordsPage.getLayout = function getLayout(page) {
    return (
        <DashboardLayout pageIndex={2}>
            {page}
        </DashboardLayout>
    )
}