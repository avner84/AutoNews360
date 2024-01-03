import { Form, useActionData } from "react-router-dom";
import { useUser } from '../../store/UserContext';
import BeatLoader from "react-spinners/BeatLoader";
import styles from './EditUser.module.css';
import { useState, useEffect } from 'react';

const override = {
    marginTop: "20px",
};

const EditUser = () => {
    const { user, setUser } = useUser();
    const data = useActionData();
    const [isLoading, setIsLoading] = useState(false);

    //If data was returned from the request and it includes the user - 
    //update the new token in local storage and the user details in the context.
    useEffect(() => {
        if (data?.user) {          
          localStorage.setItem('token', data.token);
          setUser(data.user);
          setIsLoading(false);
          if (data.success) {
            setFormState(prevState => ({ ...prevState, password: '' }));
          }
        }
    }, [data, setUser]);

    const [formState, setFormState] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        password: ''
    });

     // Handles form input changes
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormState(prevFormState => ({
            ...prevFormState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        setIsLoading(true);
    }

    return (
        <div className={styles.userEditForm}>
            <h3>Edit user details</h3>
            {(!user) ? (
                <div>Loading user details...</div>
            ) : (
                <Form method="post" onSubmit={handleSubmit}>
                    <label>
                        <span>First Name:</span>
                        <input
                            type="text"
                            name="firstName"
                            value={formState.firstName}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        <span>Last Name:</span>
                        <input
                            type="text"
                            name="lastName"
                            value={formState.lastName}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        <span>Email:</span>
                        <input
                            type="email"
                            name="email"
                            value={formState.email}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        <span>Password to verify:</span>
                        <input
                            type="password"
                            name="password"
                            value={formState.password}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <input type="hidden" name="token" value={localStorage.getItem('token')} />
                    {isLoading ? (
                       <BeatLoader color="#0056b3" cssOverride={override} />
                    ) : (
                        <button type="submit">Update details</button>
                    )}
                    {data && data.error && <p className={styles.error}>{data.error}</p>}
                    {data && data.success && <p className={styles.success}>{data.success}</p>}
                </Form>
            )}
        </div>
    );
}

export const editUserAction = async ({ request }) => {
    try {
        const data = await request.formData();
        const formData = Object.fromEntries(data);

        // Retrieve the token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found. Please log in again.');
        }

       // Send the request to the server
        const response = await fetch('http://localhost:8080/auth/edit-user', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { error: errorData.message || 'Something went wrong' };
        }

        const responseData = await response.json();
        return { success: 'User details updated successfully!', user: responseData.user, token: responseData.token };
    } catch (error) {
        return { error: error.message || 'Failed to connect to the server' };
    }
}

export default EditUser;
