import React, { useState, useContext } from 'react';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import Modal from '../../shared/components/UIElements/Modal';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import '../../shared/components/UIElements/Card';
import './PlaceItem.css'

const PlaceItem = (props) => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const auth = useContext(AuthContext);

    const [showMap, setShowMap] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const openMapHandler = () => {setShowMap(true)};

    const closeMapHandler = () => {setShowMap(false)};

    const showDeleteWarningHandler  = () => {
        setShowConfirmModal(true);
    };

    const cancelDeleteHandler = () => {
        setShowConfirmModal(false)
    };

    const confirmDeleteHandler = async () => {
        setShowConfirmModal(false); // closes the confirm modal before request is sent to prevent multiple from being opened
        try {
            await sendRequest(
                `http://localhost:5000/api/places/${props.id}`,
                'DELETE',
            );
            // reload page - but UserPlaces -> PlaceList -> PlaceItem. inside UserPlaces we have loaded places which must be changed to reflect this deletion
            props.onDelete(props.id);
        } catch(err) {}
    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            <Modal
                show={showMap}
                onCancel={closeMapHandler}
                header={props.address}
                contentClass='place-item__modal-content'
                footerClass='place-item__modal-actions'
                footer={<Button onClick={closeMapHandler}>Close</Button>}
            >
                <div className='map-container'>
                    <h2> THE MAP </h2>
                </div>
            </Modal>
            <Modal
                show={showConfirmModal}
                onCancel={cancelDeleteHandler}
                header='Are you sure?'
                footerClass='place-item__modal-actions'
                footer={
                    <React.Fragment>
                        <Button inverse onClick={cancelDeleteHandler}> Cancel </Button>
                        <Button danger onClick={confirmDeleteHandler}> Delete </Button>
                    </React.Fragment>
                }
            >
                <p> Do you want to proceed and delete this place? Please not this action cannot be undone.</p>
            </Modal>
            <li className='place-item'>
                <Card className='place-item__content'>
                    {isLoading && <LoadingSpinner asOverlay />}
                    <div className='place-item__image'>
                        <img src={props.image} alt={props.title} />
                    </div>
                    <div className='place-item__info'>
                        <h2>{props.title}</h2>
                        <h3>{props.address}</h3>
                        <p>{props.description}</p>
                    </div>
                    <div className='place-item__actions'>
                        <Button onClick={openMapHandler} inverse>View On Map</Button>
                        {auth.userId === props.creatorId && (
                            <Button to={`/places/${props.id}`}>Edit</Button>
                        )}
                        {auth.userId === props.creatorId && (
                            <Button danger onClick={showDeleteWarningHandler}>Delete</Button>
                        )}
                    </div>
                </Card>
            </li>
        </React.Fragment>
    )
};

export default PlaceItem;

