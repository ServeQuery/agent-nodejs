import {
  ManyToManySchema,
  ManyToOneSchema,
  OneToManySchema,
  OneToOneSchema,
} from '@servequery/datasource-toolkit';

type PartialBy<T, K extends Extract<keyof T, string>> = Omit<T, K> & Partial<Pick<T, K>>;

export type RelationDefinition =
  | PartialBy<ManyToOneSchema, 'foreignKeyTarget'>
  | PartialBy<OneToManySchema | OneToOneSchema, 'originKeyTarget'>
  | PartialBy<ManyToManySchema, 'foreignKeyTarget' | 'originKeyTarget'>;
