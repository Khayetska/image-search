import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import fetchSearchPhoto from './js/fetchImg';
import galleryMarkup from './templates/galleryMarkup.hbs';

const refs = {
  formEL: document.querySelector('.search-form'),
  inputEl: document.querySelector("input[name='searchQuery']"),
  gallaryEl: document.querySelector('.gallery'),
  submitBtnEl: document.querySelector("button[type='submit']"),
  loadMoreBtnEl: document.querySelector('.load-more'),
};

const messageOptions = {
  timeout: 4000,
  pauseOnHover: false,
  showOnlyTheLastOne: true,
  fontFamily: 'Montserrat',
};

let page = 1;
let perPage = 40;
let inputValue = '';
let simpleLightBox;

refs.loadMoreBtnEl.classList.add('is-hiden');

refs.formEL.addEventListener('submit', handleSearchPhotoBySubmit);
refs.loadMoreBtnEl.addEventListener('click', handleClickOnBtn);

async function handleSearchPhotoBySubmit(evt) {
  evt.preventDefault();

  page = 1;

  loadingWindow();

  inputValue = refs.inputEl.value.trim();

  if (inputValue === '') {
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.',
      messageOptions
    );
  }

  try {
    const { totalHits, hits } = await fetchSearchPhoto(
      inputValue,
      page,
      perPage
    );
    // const totalPages = Math.ceil(totalHits / perPage);
    if (hits.length === 0) {
      refs.loadMoreBtnEl.classList.add('is-hiden');
      destroyMarkup();
      return Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
        messageOptions
      );
    }

    refs.loadMoreBtnEl.classList.remove('is-hiden');

    destroyMarkup();
    makeMessageNumberOfImg(totalHits);
    createMarkup(hits);
    createSimpleLightbox();
    // one of the options how to make it:  page === Math.ceil(totalHits / 40) + 1
    // and another one: totalHits < page * perPage
    // (page - 1) * 40 >= totalHits
    // page * 40 === totalHits
    if ((page - 1) * 40 >= totalHits) {
      Notify.info(
        "We're sorry, but you've reached the end of search results.",
        messageOptions
      );
      refs.loadMoreBtnEl.classList.add('is-hiden');
    }
  } catch (error) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.',
      messageOptions
    );
  }
}

async function handleClickOnBtn() {
  page += 1;

  simpleLightBox.destroy();

  try {
    const { totalHits, hits } = await fetchSearchPhoto(
      inputValue,
      page,
      perPage
    );
    const totalPages = Math.ceil(totalHits / perPage);

    if (page > totalPages) {
      refs.loadMoreBtnEl.classList.add('is-hiden');
      Notify.info(
        "We're sorry, but you've reached the end of search results.",
        messageOptions
      );
    }
    createMarkup(hits);
    createSimpleLightbox();
    pageScroll();
  } catch (error) {
    console.log(error);
  }
}

function createMarkup(data) {
  refs.gallaryEl.insertAdjacentHTML('beforeend', galleryMarkup(data));
}

function destroyMarkup() {
  refs.gallaryEl.innerHTML = '';
}

function createSimpleLightbox() {
  simpleLightBox = new SimpleLightbox('.gallery a').refresh();
}

function makeMessageNumberOfImg(totalHits) {
  Notify.success(`Hooray! We found ${totalHits} images.`);
}

function pageScroll() {
  const { height: cardHeight } =
    refs.gallaryEl.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function loadingWindow() {
  Loading.dots('Wait a second, please...', {
    backgroundColor: 'rgba(0,59,70,0.8)',
    // textColor: '#C4DFE6',
    fontFamily: 'Montserrat',
    messageFontSize: '20px',
    messageColor: '#66A5AD',
  });
  Loading.remove(1000);
}
