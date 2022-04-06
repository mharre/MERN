import { useState, useCallback, useRef, useEffect } from 'react';

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    const activeHttpRequest = useRef([]); // stores data across rerender cycles, w/o this there is an issue when changing the page if there are active requests still going

    const sendRequest = useCallback( async (url, method='GET', body=null, headers={}) => {
        setIsLoading(true);
        const httpAbortCtrl = new AbortController();
        activeHttpRequest.current.push(httpAbortCtrl);

        try {
            const response = await fetch(url, {
                method,
                body,
                headers,
                signal: httpAbortCtrl.signal //basically links the abort controller to this specific request, we can now use it to cancel request
            });

            const responseData = response.json();

            if (!response.ok) {
                throw new Error(responseData.message);
            }
            //return data for our component to use
            return responseData

        } catch(err) {
            setError(err.message);
        }
        setIsLoading(false)
    }, []);

    const clearError = () => {
        setError(null);
    };

    useEffect(() => { //using this for clean up code to run when component unmounts. the returned function is executed as a clean up func
        return () => {
            activeHttpRequest.current.forEach(abortCtrl => abortCtrl.abort()) //aborts request to which it is linked with
        };
    }, [])

    //return sendRequest func, isloading, and error so we can also use
    return { isLoading, error, sendRequest, clearError }
};