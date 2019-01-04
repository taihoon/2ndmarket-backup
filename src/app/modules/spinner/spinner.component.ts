import { Component, OnInit } from '@angular/core';
import { SpinnerService } from './spinner.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-modal',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {
  show: boolean;

  constructor(private spinnerService: SpinnerService) {
    const show$ = this.spinnerService.show$;

    show$.subscribe(isShow => this.show = isShow);
  }

  ngOnInit() {
  }

}
