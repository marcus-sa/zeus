import { Component, Inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { assert } from '@deepkit/type';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { NgIf } from '@angular/common';

import { InvalidRoomPasswordError, Room } from '@apex/api/shared';

import {
  ApexButtonComponent,
  ApexDialogBodyComponent,
  ApexDialogTitleComponent,
  ApexInputComponent,
} from '../ui';

export interface ApexPasswordProtectedRoomDialogData {
  readonly room: Room;
}

@Component({
  selector: 'apex-password-protected-room-dialog',
  standalone: true,
  template: `
    <div apexDialogBody [class.animation-shake]="error()">
      <apex-dialog-title closeable>{{ data.room.name }}</apex-dialog-title>
      <p class="text-xs text-white">This room is protected with a door code.</p>
      <input
        apex
        type="text"
        [class.border]="error()"
        [class.border-red-700]="error()"
        [(ngModel)]="password"
        (keydown)="error.set(null)"
      />
      <span class="text-red-700" *ngIf="isInvalidDoorCodeError(error())">
        Invalid door code ...
      </span>
      <div class="flex justify-between">
        <button apex (click)="submit()">Enter</button>
        <button apex (click)="close()">Cancel</button>
      </div>
    </div>
  `,
  imports: [
    ApexButtonComponent,
    ApexInputComponent,
    ApexDialogTitleComponent,
    ApexDialogBodyComponent,
    FormsModule,
    NgIf,
  ],
})
export class PasswordProtectedRoomDialogComponent {
  password: string;

  error = signal<InvalidRoomPasswordError | Error | null>(null);

  readonly #onSubmit = new Subject<string>();

  get onSubmit(): Observable<string> {
    return this.#onSubmit.asObservable();
  }

  constructor(
    protected readonly dialogRef: DialogRef,
    @Inject(DIALOG_DATA) readonly data: ApexPasswordProtectedRoomDialogData,
  ) {
    assert<Room>(data);

    dialogRef.closed.subscribe(() => {
      this.#onSubmit.complete();
    });
  }

  protected isInvalidDoorCodeError(
    error: unknown,
  ): error is InvalidRoomPasswordError {
    return error instanceof InvalidRoomPasswordError;
  }

  close() {
    this.dialogRef.close();
  }

  protected submit() {
    this.#onSubmit.next(this.password);
  }
}
