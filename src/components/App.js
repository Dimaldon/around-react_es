import React, { useState, useEffect } from "react";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import AddPlacePopup from "./AddPlacePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import EditProfilePopup from "./EditProfilePopup";
import ImagePopup from "./ImagePopup";
import api from "../utils/api";

function App() {
  const [isEditProfilePopupOpen, setisEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setisAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setisAvatarPopupOpen] = useState(false);
  const [isImagePopupOpen, setisImagePopupOpen] = useState(false);
  const [currentUser, setcurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [selectedCard, setselectedCard] = useState({});

  function handleEditAvatarClick() {
    setisAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setisEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setisAddPlacePopupOpen(true);
  }

  function handleClosePopup() {
    setisAvatarPopupOpen(false);
    setisAddPlacePopupOpen(false);
    setisEditProfilePopupOpen(false);
    setisImagePopupOpen(false);
    setTimeout(() => {
      setselectedCard({});
    }, 300);
  }

  function handleCardClick(oCard) {
    setselectedCard(oCard);
    setisImagePopupOpen(true);
  }
  // handleCardLike se encarga de manejar el evento de dar "like" a una tarjeta
  function handleCardLike(oCard) {
    // verifica si el usuario actual ya ha dado "like" a la tarjeta
    const isLiked = oCard.likes.some(
      (oUsuario) => oUsuario._id === currentUser._id
    );

    // envía una solicitud a la API para cambiar el estado de "like" de la tarjeta
    // recibe los datos actualizados de la tarjeta, actualiza el estado de las tarjetas en función de esos datos
    api.changeLikeCardStatus(oCard._id, !isLiked).then((newCard) => {
      setCards((state) =>
        state.map((c) => (c._id === newCard._id ? newCard : c))
      );
    });
  }

  function handleCardDelete(oCard) {
    api.deleteCard(oCard._id).then(() => {
      setCards((state) => state.filter((card) => card._id !== oCard._id));
    });
  }

  function handleUpdateUser(oInfoUser) {
    api.setUserInfo(oInfoUser.name, oInfoUser.about).then(() => {
      setcurrentUser({
        name: oInfoUser.name,
        about: oInfoUser.about,
        avatar: currentUser.avatar,
        _id: currentUser._id,
      });
      handleClosePopup();
    });
  }

  function handleUpdateAvatar(oAvatarUser) {
    api.updateUserMeAvatar(oAvatarUser.avatar).then(() => {
      setcurrentUser({
        avatar: oAvatarUser.avatar,
        name: currentUser.name,
        about: currentUser.about,
        _id: currentUser._id,
      });
      handleClosePopup();
    });
  }

  function handleAddPlaceSubmit(oAddPlace) {
    api.postNewCard(oAddPlace.title, oAddPlace.url).then((newCard) => {
      setCards([newCard, ...cards]);
      handleClosePopup();
    });
  }

  useEffect(() => {
    api
      .getInitialUserMe()
      .then((res) => {
        setcurrentUser(res);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    api
      .getInitialCards()
      .then((res) => {
        setCards(res);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <Header />
      <Main
        handleEditProfileClick={handleEditProfileClick}
        handleAddPlaceClick={handleAddPlaceClick}
        handleEditAvatarClick={handleEditAvatarClick}
        cards={cards}
        handleCardClick={handleCardClick}
        handleCardLike={handleCardLike}
        handleCardDelete={handleCardDelete}
      />
      <Footer />
      <AddPlacePopup
        title="Nuevo lugar"
        name=""
        onClose={handleClosePopup}
        isOpen={isAddPlacePopupOpen ? "true" : ""}
        onAddPlaceSubmit={handleAddPlaceSubmit}
      ></AddPlacePopup>
      <EditAvatarPopup
        title="Cambiar foto de perfil"
        name=""
        onClose={handleClosePopup}
        isOpen={isEditAvatarPopupOpen ? "true" : ""}
        onUpdateAvatar={handleUpdateAvatar}
      />
      <EditProfilePopup
        title="Editar Perfil"
        name=""
        onClose={handleClosePopup}
        isOpen={isEditProfilePopupOpen ? "true" : ""}
        onUpdateUser={handleUpdateUser}
      />
      <ImagePopup
        selectedCard={selectedCard}
        onClose={handleClosePopup}
        isOpen={isImagePopupOpen ? "true" : ""}
      />
    </CurrentUserContext.Provider>
  );
}

export default App;
