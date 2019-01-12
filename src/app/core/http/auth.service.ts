import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Observable, of, forkJoin } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { AFSimpleUser, Group, User } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _user: User | null;
  private _group: Group | null;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore) {
    this.afAuth.user.pipe(
      filter(afUser => !afUser)
    ).subscribe(() => {
      this._user = null;
      this._group = null;
    });
  }

  get afUser(): Observable<firebase.User> {
    return this.afAuth.user.pipe(first());
  }

  get afSimpleUser(): Observable<AFSimpleUser> {
    return this.afAuth.user.pipe(
      first(),
      filter(afUser => !!afUser),
      switchMap(afUser => {
        return of({
          uid: afUser.uid,
          displayName: afUser.displayName,
          photoURL: afUser.photoURL
        });
      })
    );
  }

  get user(): User {
    return this._user;
  }

  get group(): Group {
    return this._group;
  }

  resolveAuthInfo() {
    const afUser$ = this.afAuth.user.pipe(first());

    const user$ = afUser$.pipe(
      switchMap((afUser) => {
        if (afUser !== null) {
          return this.afs.doc<User>(`users/${afUser.uid}`).snapshotChanges().pipe(
            first(),
            map(user => ({ id: user.payload.id, ...user.payload.data() }))
          );
        } else {
          return of(null);
        }
      })
    );

    const group$ = user$.pipe(
      switchMap(user => {
        if (user !== null ) {
          const groupRef = user.groupRef as DocumentReference;
          return fromPromise(groupRef.get()).pipe(
            first(),
            map(group => ({id: group.id, ...group.data()} as Group)),
          );
        } else {
          return of(null);
        }
      })
    );

    return forkJoin(afUser$, user$, group$).pipe(
      tap(([afUser, user, group]) => {
        this._user = user;
        this._group = group;
      })
    );
  }

  login(target: string) {
    let provider;

    if (target === 'facebook') {
      provider = new firebase.auth.FacebookAuthProvider();
    } else if (target === 'github') {
      provider = new firebase.auth.GithubAuthProvider();
    } else if (target === 'twitter') {
      provider = new firebase.auth.TwitterAuthProvider();
    } else if (target === 'google') {
      provider = new firebase.auth.GoogleAuthProvider();
    }

    return this.afAuth.auth.signInWithPopup(provider);
  }

  logout() {
    return this.afAuth.auth.signOut();
  }

  updateDisplayName(displayName: string) {
    return this.afAuth.user.pipe(
      switchMap(user => {
        return user.updateProfile({
          displayName,
          photoURL: user.photoURL
        });
      })
    );
  }

}
