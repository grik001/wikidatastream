import "react-table";

declare module "react-table" {
  export interface TableInstance<D extends object = {}> extends UseTableInstanceProps<D>, UseSortByInstanceProps<D> {}
  export interface TableState<D extends object = {}> extends UseSortByState<D> {}
  export interface Column<D extends object = {}> extends UseSortByColumnOptions<D> {}
  export interface HeaderGroup<D extends object = {}> extends ColumnInstance<D> {}
  export interface ColumnInstance<D extends object = {}> extends UseTableColumnProps<D>, UseSortByColumnProps<D> {}
}
