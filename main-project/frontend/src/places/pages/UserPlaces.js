import React, { useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import PlaceList from '../components/PlaceList';

const UserPlaces = () => {
    const [loadedPlaces, setLoadedPlaces] = useState();

    const userId = useParams().userId;

    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    useEffect(() => {
        const fetchUserPlacesById = async () => {
            try {
                const responseData = await sendRequest(`http://localhost:5000/api/places/user/${userId}`); // check BE to see what we recieve back - we except places key
                setLoadedPlaces(responseData.places);
                //console.log(responseData)
            } catch(err) {}

        };
        fetchUserPlacesById();
    }, [sendRequest, userId]);

    const placeDeletedHandler = (deletedPlaceId) => {
        //update our loaded places appropriately // only keep places where the id is not equal the deletedPlaceId
        setLoadedPlaces(prevPlaces =>
            prevPlaces.filter(place => place.id !== deletedPlaceId )
        );
    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className='center'>
                    <LoadingSpinner />
                </div>
            )}
            {!isLoading && loadedPlaces && (
                <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />
            )}
        </React.Fragment>
    )
};

export default UserPlaces;