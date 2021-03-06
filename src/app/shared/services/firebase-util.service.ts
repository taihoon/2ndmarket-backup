import { Injectable } from '@angular/core';
import { DocumentChangeAction } from '@angular/fire/firestore';

import * as firebase from 'firebase/app';
import FieldValue = firebase.firestore.FieldValue;
import OrderByDirection = firebase.firestore.OrderByDirection;
import WhereFilterOp = firebase.firestore.WhereFilterOp;
import QuerySnapshot = firebase.firestore.QuerySnapshot;

export interface FirebaseQueryBuilderOptions {
  where?: [string, string, any][];
  orderBy?: [string, string][];
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseUtilService {

  constructor() { }

  buildQuery(ref: firebase.firestore.Query, options: FirebaseQueryBuilderOptions) {
    let query = ref as firebase.firestore.Query;

    if (options.where) {
      options.where.forEach(where => {
        if (where) {
          query = query.where(where[0], where[1] as WhereFilterOp, where[2]);
        }
      });
    }

    if (options.orderBy) {
      options.orderBy.forEach(orderBy => {
        query = query.orderBy(orderBy[0], orderBy[1] as OrderByDirection);
      });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    return query;
  }

    sirializeDocumentChangeActions(actions: DocumentChangeAction<any>[]) {
      return actions.map(action => ({
        id: action.payload.doc.id,
        ...action.payload.doc.data()
      }));
    }

  dispatchAction(action: any) {
    if (action.payload.exists) {
      return {
        id: action.payload.id,
        ...action.payload.data()
      };
    } else {
      return null;
    }
  }

  dispatchQuerySnapshot(querySnapshot: QuerySnapshot) {
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  }

  dispatchSnapshot(snapshot: any) {
    if (snapshot.exists) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      };
    } else {
      return null;
    }
  }

  getServerTimeStamp(): FieldValue {
    return FieldValue.serverTimestamp();
  }

}
