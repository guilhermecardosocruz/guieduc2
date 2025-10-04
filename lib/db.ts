import { openDB, IDBPDatabase } from 'idb';

export type DBSchema = {
  meta: { key: string; value: any };
  user: { key: string; value: { id:string; name:string; email:string; updatedAt:number } };
  classes: { key: string; value: { id:string; name:string; updatedAt:number } };
  lessons: { key: string; value: { id:string; classId:string; date:string; updatedAt:number } };
  attendance: { key: string; value: { id:string; lessonId:string; studentId:string; present:boolean; updatedAt:number } };
  queue: { key: string; value: { id:string; method:'POST'|'PUT'|'DELETE'; url:string; body:any; ts:number } };
};

let _db: IDBPDatabase<DBSchema>;
export async function db() {
  if (_db) return _db;
  _db = await openDB<DBSchema>('guieduc2', 1, {
    upgrade(d) {
      if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta');
      if (!d.objectStoreNames.contains('user')) d.createObjectStore('user');
      if (!d.objectStoreNames.contains('classes')) d.createObjectStore('classes');
      if (!d.objectStoreNames.contains('lessons')) d.createObjectStore('lessons');
      if (!d.objectStoreNames.contains('attendance')) d.createObjectStore('attendance');
      if (!d.objectStoreNames.contains('queue')) d.createObjectStore('queue');
    }
  });
  return _db;
}
