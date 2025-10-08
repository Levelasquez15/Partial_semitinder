import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ButtonModule } from './components/button/button.module';
import { InputModule } from './components/input/input.module';
import { LinkModule } from './components/link/link.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ButtonModule,
    InputModule,
    LinkModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ButtonModule,
    InputModule,
    LinkModule
  ]
})
export class SharedModule {}
