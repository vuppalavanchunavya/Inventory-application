import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DatabaseService } from './services/database.service';
import { RouteReuseStrategy } from '@angular/router';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { IonicStorageModule } from '@ionic/storage-angular';
import { NetworkService } from './services/network.service';
import { SharedModule } from './shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http'; 
import { SubinventorylistComponent } from './component/subinventorylist/subinventorylist.component';
import { LocatorlistComponent } from './component/locatorlist/locatorlist.component';
import { LotlistComponent } from './component/lotlist/lotlist.component';
import { SeriallistComponent } from './component/seriallist/seriallist.component';
import { ChildlotlistComponent } from './component/childlotlist/childlotlist.component';
import { SerialNumberlistComponent } from './component/serial-numberlist/serial-numberlist.component';

@NgModule({
  declarations: [
    AppComponent,
    SubinventorylistComponent,
    LocatorlistComponent,
    LotlistComponent,
    SeriallistComponent,
    ChildlotlistComponent,
    SerialNumberlistComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
    SharedModule,
    FormsModule, 
    ReactiveFormsModule 
  ],
  providers: [
    DatabaseService,
    SQLite,
    NetworkService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
