import React, { useEffect, useState } from "react";
import Loader from "../Loader";
import axios from "../../api/axios";
import Error from "../Error";
import "../../styles/dashboard.css";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const token = sessionStorage.getItem("token");
    const [data, setData] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        document.title = "KanBan | Dashboard";
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(`/dashboard`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setData(response.data);
        } catch (error) {
            setError(error?.response?.data);
        }
    };

    return (
        <div className="content col-10">
            {data === null ? (
                error ? (
                    <Error error={error} />
                ) : (
                    <Loader data_to_load={data} text_if_cant_load="No dashboard data available!" />
                )
            ) : (
                <div className="dashboard-container">
                    <h1 className="header">Dashboard</h1>
                    <div className="dashboard-stats">
                        <div className="stat-card">
                            <p className="stat-value">{data.teamCount}</p>
                            <p className="stat-label">Teams</p>
                        </div>
                        <div className="stat-card">
                            <p className="stat-value">{data.boardCount}</p>
                            <p className="stat-label">Boards</p>
                        </div>
                        <div className="stat-card">
                            <p className="stat-value">{data.logCount}</p>
                            <p className="stat-label">Activity Logs</p>
                        </div>
                    </div>
                    <div className="dashboard-favourites">
                        <h2>Favourite boards</h2>
                        {data.favourites.length > 0 ? (
                            <div className="boards">
                                {data.favourites.map((board) => (
                                    <div className="board" key={board.board_id}>
                                        <Link
                                            to={`/board/${board.board_id}`}
                                            className="board-title"
                                        >
                                            <p>{board.board_name}</p>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No favourites available.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
