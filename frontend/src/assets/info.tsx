import axios from 'axios';
import { useState } from 'react';

const Info = () => {
    const [message, setMessage] = useState<string>('');
    const [display, setDisplay] = useState<string>('');

    const sendResponse = (event: React.FormEvent) => {
        event.preventDefault();
        console.log('Sending message:', message);
    
        axios.post('http://localhost:3000/', { message: message })
            .then(response => {
                console.log('Response:', response.data);
                setDisplay(response.data.updatedMessage);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    }

    return (
        <>
            <form onSubmit={sendResponse}>
                <label>
                    Enter Something
                    <input type='text' value={message} onChange={handleValueChange}/>
                </label>
                <button type='submit'>
                    Submit
                </button>
            </form>
            <h1>{display}</h1>
        </>
    )
}

export default Info
