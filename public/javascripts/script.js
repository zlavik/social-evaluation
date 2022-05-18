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

const button = $('.button');
const spinner = '<span class="spinner"></span>';

button.click(() => {
  if (!button.hasClass('loading')) {
    button.toggleClass('loading').html(spinner);
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
  const searchText = document.querySelector('.search');
  tableList.search(searchText.value);
  setTimeout(() => {
    tableList.search('');
    searchText.value = 'Search...';
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
