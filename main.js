// Do your work here...
console.log('Hello, world!');

class Book {
  constructor(id, title, author, year, isComplete) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.year = year;
    this.isComplete = isComplete;
  }
}

class Bookshelf {
  constructor() {
    this.books = this.loadBooksFromStorage();
    this.searchMode = false;
    this.searchResults = [];
    
    this.init();
  }
  
  init() {
    this.renderBooks();
    this.setupEventListeners();
  }
  
  loadBooksFromStorage() {
    const storedBooks = localStorage.getItem('bookshelf_books');
    return storedBooks ? JSON.parse(storedBooks) : [];
  }
  
  saveBooksToStorage() {
    localStorage.setItem('bookshelf_books', JSON.stringify(this.books));
  }
  
  addBook(title, author, year, isComplete) {
    const id = Number(new Date()); 
    const newBook = new Book(id, title, author, year, isComplete);
    this.books.push(newBook);
    this.saveBooksToStorage();
    this.renderBooks();
  }
  
  updateBook(id, title, author, year, isComplete) {
    const bookIndex = this.books.findIndex(book => book.id === id);
    if (bookIndex !== -1) {
      this.books[bookIndex] = {
        id,
        title,
        author,
        year: parseInt(year),
        isComplete
      };
      this.saveBooksToStorage();
      this.renderBooks();
      return true;
    }
    return false;
  }
  
  deleteBook(id) {
    this.books = this.books.filter(book => book.id !== parseInt(id));
    this.saveBooksToStorage();
    this.renderBooks();
  }
  
  toggleBookCompletion(id) {
    const book = this.books.find(book => book.id === parseInt(id));
    if (book) {
      book.isComplete = !book.isComplete;
      this.saveBooksToStorage();
      this.renderBooks();
    }
  }
  
  searchBooks(title) {
    if (!title.trim()) {
      this.searchMode = false;
      this.searchResults = [];
      this.renderBooks();
      return;
    }
    
    this.searchMode = true;
    this.searchResults = this.books.filter(book => 
      book.title.toLowerCase().includes(title.toLowerCase())
    );
    this.renderBooks();
  }
  
  renderBooks() {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');
    
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';
    
    const booksToRender = this.searchMode ? this.searchResults : this.books;
    
    if (booksToRender.length === 0) {
      if (this.searchMode) {
        incompleteBookList.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-search"></i>
            <h3>Buku tidak ditemukan</h3>
            <p>Tidak ada buku yang sesuai dengan pencarian Anda</p>
          </div>
        `;
      } else {
        incompleteBookList.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-book-open"></i>
            <h3>Belum ada buku</h3>
            <p>Tambahkan buku baru untuk melihatnya di sini</p>
          </div>
        `;
        
        completeBookList.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-trophy"></i>
            <h3>Belum ada buku</h3>
            <p>Buku yang sudah selesai dibaca akan muncul di sini</p>
          </div>
        `;
      }
      return;
    }
    
    booksToRender.forEach(book => {
      const bookElement = this.createBookElement(book);
      
      if (book.isComplete) {
        completeBookList.appendChild(bookElement);
      } else {
        incompleteBookList.appendChild(bookElement);
      }
    });
    
    this.updateFormButtonText();
  }
  
  createBookElement(book) {
    const bookElement = document.createElement('div');
    bookElement.setAttribute('data-bookid', book.id);
    bookElement.setAttribute('data-testid', 'bookItem');
    
    bookElement.innerHTML = `
      <span class="status-badge ${book.isComplete ? 'status-complete' : 'status-incomplete'}">
        ${book.isComplete ? 'Selesai' : 'Belum Selesai'}
      </span>
      <h3 data-testid="bookItemTitle">${book.title}</h3>
      <p data-testid="bookItemAuthor"><i class="fas fa-user"></i> Penulis: ${book.author}</p>
      
      <p data-testid="bookItemYear">
        <i class="fas fa-calendar-alt"></i> Tahun: 
        <span class="year-badge">${book.year}</span>
      </p>
      
      <div>
        <button data-testid="bookItemIsCompleteButton">
          <i class="fas ${book.isComplete ? 'fa-undo' : 'fa-check'}"></i> ${book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca'}
        </button>
        <button data-testid="bookItemDeleteButton">
          <i class="fas fa-trash"></i> Hapus Buku
        </button>
        <button data-testid="bookItemEditButton">
          <i class="fas fa-edit"></i> Edit Buku
        </button>
      </div>
    `;
    
    const completeButton = bookElement.querySelector('[data-testid="bookItemIsCompleteButton"]');
    const deleteButton = bookElement.querySelector('[data-testid="bookItemDeleteButton"]');
    const editButton = bookElement.querySelector('[data-testid="bookItemEditButton"]');
    
    completeButton.addEventListener('click', () => {
      this.toggleBookCompletion(bookElement.getAttribute('data-bookid'));
    });
    
    deleteButton.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
        this.deleteBook(bookElement.getAttribute('data-bookid'));
      }
    });
    
    editButton.addEventListener('click', () => {
      this.openEditModal(book);
    });
    
    return bookElement;
  }
  
  openEditModal(book) {
    const modal = document.getElementById('editModal');
    const form = document.getElementById('editBookForm');
    
    document.getElementById('editBookId').value = book.id;
    document.getElementById('editBookTitle').value = book.title;
    document.getElementById('editBookAuthor').value = book.author;
    document.getElementById('editBookYear').value = book.year;
    document.getElementById('editBookIsComplete').checked = book.isComplete;
    
    modal.style.display = 'block';
    
    form.onsubmit = (e) => {
      e.preventDefault();
      
      const id = document.getElementById('editBookId').value;
      const title = document.getElementById('editBookTitle').value;
      const author = document.getElementById('editBookAuthor').value;
      const year = document.getElementById('editBookYear').value;
      const isComplete = document.getElementById('editBookIsComplete').checked;
      
      if (this.updateBook(parseInt(id), title, author, year, isComplete)) {
        modal.style.display = 'none';
      }
    };
  }
  
  updateFormButtonText() {
    const checkbox = document.getElementById('bookFormIsComplete');
    const buttonSpan = document.querySelector('#bookFormSubmit span');
    
    buttonSpan.textContent = checkbox.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
    
    checkbox.addEventListener('change', () => {
      buttonSpan.textContent = checkbox.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
    });
  }
  
  setupEventListeners() {
    const bookForm = document.getElementById('bookForm');
    const submitButton = document.getElementById('bookFormSubmit');
    const searchForm = document.getElementById('searchBook');

    const originalButtonHTML = submitButton.innerHTML;

    document.querySelector('.close').addEventListener('click', () => {
      document.getElementById('editModal').style.display = 'none';
    });

    window.addEventListener('click', (event) => {
      const modal = document.getElementById('editModal');
      if (event.target === modal) {
      modal.style.display = 'none';
      }
    });

    bookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const title = document.getElementById('bookFormTitle').value;
      const author = document.getElementById('bookFormAuthor').value;
      const year = document.getElementById('bookFormYear').value;
      const isComplete = document.getElementById('bookFormIsComplete').checked;
      
      this.addBook(title, author, parseInt(year), isComplete);
      
      bookForm.reset();
      this.updateFormButtonText();
      
      submitButton.innerHTML = '<i class="fas fa-check"></i> Buku Berhasil Ditambahkan!';
      submitButton.classList.add('success-state');
      
      setTimeout(() => {
        submitButton.innerHTML = originalButtonHTML;
        submitButton.classList.remove('success-state');
      }, 2000);
    });
    
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const title = document.getElementById('searchBookTitle').value;
      this.searchBooks(title);
    });
    
    this.updateFormButtonText();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Bookshelf();
});