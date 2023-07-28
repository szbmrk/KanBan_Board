import { useEffect, useState } from 'react'

export default function Dashboard() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const user_id = sessionStorage.getItem('user_id');
        const username = sessionStorage.getItem('username');
        const email = sessionStorage.getItem('email');
        if (token && user_id && username && email) {
            setUser({ user_id: user_id, username: username, email: email, token: token });
        }
    }, []);

    return (
        <div>
            {user && <div>
                <h1>Welcome {user.username}</h1>
                <h2>Your user id is {user.user_id}</h2>
                <h2>Your email is {user.email}</h2>
                <h3>Your token is {user.token}</h3>
            </div>}

        </div>
    )
}
