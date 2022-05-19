$(document).ready(() => {
  const errorFlash = document.querySelector('.error');
  const successFlash = document.querySelector('.success');
  const infoFlash = document.querySelector('.info');

  if (successFlash || errorFlash || infoFlash) {
    setTimeout(() => {
      $(successFlash).fadeOut(2500);
      $(errorFlash).fadeOut(2500);
      $(infoFlash).fadeOut(2500);
    }, '5000');
  }
});

let isSubmitted = false;
$('#addUserForm').submit(() => {
  if (!isSubmitted) {
    isSubmitted = true;
    button.click();
  } else {
    return false;
  }
});

const options = {
  valueNames: ['name', 'score', 'followerCount'],
  page: 5,
  pagination: {
    innerWindow: 1,
    left: 0,
    right: 0,
    paginationClass: 'pagination',
  },
};

const tableList = new List('tableID', options);

$(document).ready(() => {
  const searchText = document.querySelector('.search').value;
  tableList.search(searchText);
  setTimeout(() => {
    tableList.search('');
    document.querySelector('.search').value = '';
  }, '7000');
});

$('.jPaginateNext').on('click', () => {
  const list = $('.pagination').find('li');
  $.each(list, (position, element) => {
    if ($(element).is('.active')) {
      $(list[position + 1]).trigger('click');
    }
  });
});

$('.jPaginateBack').on('click', () => {
  const list = $('.pagination').find('li');
  $.each(list, (position, element) => {
    if ($(element).is('.active')) {
      $(list[position - 1]).trigger('click');
    }
  });
});

const button = $('.button');
const spinner = '<span class="spinner"></span>';
const loadingText = document.querySelector('#loadingText');
const preloadingText = document.querySelector('#preloadingText');

loadingText.hidden = true;
preloadingText.hidden = false;
button.click(() => {
  if (!button.hasClass('loading')) {
    button.toggleClass('loading').html(spinner);
    preloadingText.hidden = true;

    loadingText.hidden = false;
  }
});
