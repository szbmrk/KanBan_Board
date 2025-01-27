import React, { useEffect, useState } from "react";
import Loader from "../Loader";
import axios from "../../api/axios";
import Error from "../Error";

export default function Dashboard() {

    const token = sessionStorage.getItem("token");
    const [data, setData] = useState(null);
    const [redirect, setRedirect] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        document.title = "KanBan | Dashboard";
        fetchData();
    }, []);

    const fetchData = async () => {
        try {

        } catch (error) {
            setError(error?.response?.data);
        }
    }

    return (
        <>
            <div className="content col-10" >
                {data === null ? (
                    error ? (
                        <Error error={error} redirect={redirect} />
                    ) : (
                        <Loader data_to_load={data} text_if_cant_load={"No dashboard data available!"} />
                    )
                ) : (
                    <></>
                )}
            </div>
        </>
    )
}
