import { useEffect, useState } from 'react'

export default function Dashboard() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const username = sessionStorage.getItem('username');
        const email = sessionStorage.getItem('email');
        if (token && username && email) {
            setUser({ username: username, email: email, token: token });
        }
    }, []);

    return (
        <div>
            {user && <div>
                <h1>Welcome {user.username}</h1>
                <h2>Your email is {user.email}</h2>
                <h3>Your token is {user.token}</h3>
            </div>}

        </div>
    )
}
