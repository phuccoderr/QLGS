export interface ApiPagination<T> {
  total_items: 1;
  total_pages: 1;
  current_page: 1;
  entities: T[];
}
