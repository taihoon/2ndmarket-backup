import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SignInService } from '@app/core/sign-in.service';
import { NotificationService } from '@app/core/http';
import { LocationService } from '@app/shared/services';
import { Notification } from '@app/core/models';

@Component({
  selector: 'app-notification',
  templateUrl: './preference-notification.component.html',
  styleUrls: ['./preference-notification.component.css']
})
export class PreferenceNotificationComponent implements OnInit {
  readonly user: any;
  notifications$: Observable<Notification[]>;

  constructor(
    private signIn: SignInService,
    private locationService: LocationService,
    private notificationService: NotificationService
  ) {
    const user = this.signIn.user;
    this.user = {
      photoURL: user.photoURL,
      displayName: user.displayName,
      desc: user.desc
    };
    this.notifications$ = this.notificationService.getNotifications();
  }

  ngOnInit() {
  }

  goBack(e: any) {
    e.preventDefault();
    this.locationService.goBack();
  }

}
