
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { SubinventorylistComponent } from 'src/app/component/subinventorylist/subinventorylist.component';
import { LocatorlistComponent } from 'src/app/component/locatorlist/locatorlist.component';
import { LotlistComponent } from 'src/app/component/lotlist/lotlist.component'; 
import { SeriallistComponent } from 'src/app/component/seriallist/seriallist.component'; 
import { ApiService } from 'src/app/services/api.service';
import { Storage } from '@ionic/storage-angular'; 
import { NetworkService } from 'src/app/services/network.service';

interface Lot {
  lotQty: number | null;
  selectedLot: string;
}
@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.page.html',
  styleUrls: ['./item-details.page.scss'],
})

export class ItemDetailsPage implements OnInit {
  item: any;
  poNumber: string = '';
  receivedQty: number = 0;
  shipmentNumber: string = '';
  destinationType: string = '';
  isLotControlled: boolean = false;
  isSerialControlled: boolean = false;
  inputQuantity: any="";
  inputSubInventory: string = '';
  selectedSubInventoryCode: string = ''; 
  inputLocator: string = '';
  selectedLocatorCode: string = ''; 
  subInventories: any[] = [];
  locators: any[] = [];
  selectedSerialCount: number = 0;
  employeeId: string = ''; 
  UserId: string = '';
  selectedOrganization: any;
  selectedLotCount: number = 0;
  quantityExceedsTolerance: boolean = false;
  uomCode: any;
  convertedLotData:any;
  UnitOfMeasure: any;
  ItemRevision: any;
  serialData:any[]=[];
  isOnline:boolean=true;
  lotData: any;
  lots: any;
  selectedLotsCodes: any;
  totalLotQuantity: any;
  isInputDisabled = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private alertController: AlertController,
    private sqliteService: SQLiteService,
    private modalController: ModalController,
    private apiService: ApiService,
    private storage: Storage,
    private toastController: ToastController, 
    private networkService:NetworkService
  ) {}
  

  async ngOnInit() {
    await this.storage.create();
    this.selectedOrganization = await this.storage.get('selectedorg');

    this.activatedRoute.queryParams.subscribe(params => {
      const itemData = params['item'];
      this.item = itemData ? JSON.parse(itemData) : null;
      this.poNumber = params['poNumber'] || '';

      if (this.item) {
        this.receivedQty = this.item.QtyReceived || 0;
        this.shipmentNumber = this.item.ShipmentNumber || '';
        this.destinationType = this.item.DestinationType || '';
        this.isLotControlled = this.item.IsLotControlled === 'True';
        this.isSerialControlled = this.item.IsSerialControlled === 'True';
        this.inputSubInventory = this.item.DefaultSubInventoryCode || '';
        this.inputLocator = this.item.DefaultLocator || '';
      }
    });
    
   
    
    this.networkService.onNetworkChange((isOnline: boolean) => {
      this.isOnline = isOnline;
      console.log(isOnline)
      if (!isOnline) {
        this.presentToast('You are offline');
      }
    });
  }
 changeQuantity(event:any){
  this.inputQuantity=event.target.value;
  
 }

 async presentToast(message: string, color: 'success' | 'danger' = 'danger', duration: number = 2000) {
  const toast = await this.toastController.create({
    message,
    color,
    duration,
    position: 'bottom'
  });
  toast.present();
}

  hasDefaultSubInventory(): boolean {
    return !!this.item?.DefaultSubInventoryCode;
  }

  hasDefaultLocator(): boolean {
    return !!this.item?.DefaultLocator;
  }
 

  async showSubInventoryList() {
    try {
      this.subInventories = await this.sqliteService.getDataFromTable('Subinventories');
      const modal = await this.modalController.create({
        component: SubinventorylistComponent,
        componentProps: { subInventories: this.subInventories }
      });
      modal.onDidDismiss().then((data) => {
        if (data.data) {
          this.inputSubInventory = data.data.selectedSubInventory.SubInventoryName;
          this.selectedSubInventoryCode = data.data.selectedSubInventory.SubInventoryCode;
         
        }
      });
      await modal.present();
    } catch (error) {
      console.error('Error fetching sub-inventories:', error);
    }
  }

  async showLocatorList() {
    try {
      const allLocators = await this.sqliteService.getDataFromTable('Locators');
      this.locators = allLocators.filter(locator => locator.SubInventoryCode === this.selectedSubInventoryCode);
      const modal = await this.modalController.create({
        component: LocatorlistComponent,
        componentProps: { locators: this.locators }
      });
      modal.onDidDismiss().then((data) => {
        if (data.data) {
          this.inputLocator = data.data.selectedLocator.LocatorId;
          console.log(this.inputLocator)
        }
      });
      await modal.present();
    } catch (error) {
      console.error('Error fetching or filtering locators:', error);
    }
  }

  
  async showLotList() {
    try {
        const allLots = await this.sqliteService.getDataFromTable('lots');
        const filteredLots = allLots.filter(lot => 
            lot.SubInventoryCode === this.selectedSubInventoryCode && 
            lot.LocatorId === this.inputLocator &&                  
            lot.ItemNumber === this.item.ItemNumber &&               
            lot.ChildLot                                             
        );

        const modal = await this.modalController.create({
            component: LotlistComponent,
            componentProps: { 
                childLots: filteredLots.map(lot => lot.ChildLot), 
                itemNumber: this.item.ItemNumber,
                poNumber: this.poNumber,
                itemDesc: this.item.ItemDesc,
                locator: this.inputLocator,
                subInventoryCode: this.selectedSubInventoryCode,
                quantity: this.inputQuantity 
            }
        });

        modal.onDidDismiss().then((data: any) => {
          console.log(data.data.selectedLots)
            if (data && data.data && data.data.selectedLots && data.data.selectedLots.length > 0) {
                this.selectedLotCount = data.data.selectedLotCount || 0;
                this.convertedLotData = data.data.selectedLots || []; 
                console.log(this.convertedLotData)
            } else {
                this.selectedLotCount = 0;
                this.convertedLotData = [];
            }
        });
        await modal.present();
    
    } catch (error) {
        console.error('Error fetching or filtering lots:', error);
    }
}
  
  async showSerialList() {
    try {
      const allSerials = await this.sqliteService.getDataFromTable('Serials');
      const filteredSerials = allSerials.filter(serial => 
        serial.SubInventoryCode === this.selectedSubInventoryCode && 
        serial.LocatorId === this.inputLocator &&
        serial.ItemNumber === this.item.ItemNumber
      );
  
      const modal = await this.modalController.create({
        component: SeriallistComponent,
        componentProps: { 
          serials: filteredSerials,
          itemNumber: this.item.ItemNumber,
          poNumber: this.poNumber,
          itemDesc: this.item.ItemDesc,
          quantity: this.inputQuantity 
        }
      });
  
      modal.onDidDismiss().then((data) => {
        console.log("serial",data)
        if (data.data) {
          this.serialData=data.data.selectedSerial;
          this.selectedSerialCount = data.data.SerialCount; 
          console.log(data.data.SerialCount)
        }
      });
  
      await modal.present();
    } catch (error) {
      console.error('Error fetching or filtering serials:', error);
    }
  }
  
  
  async createGoodsReceipt() {
    let goodsReceiptPayload=this.onlinePayload();
    let transactionPayload=this.transactionOfflinePayload();
    if(this.isOnline==true){
    try {
      this.apiService.createGoodsReceiptTransactions(goodsReceiptPayload).subscribe(
        response => {
          console.log('Success:', response.Response[0]);
          if (response.Response[0].RecordStatus=== 'S') {
            transactionPayload.status = response.Response[0].RecordStatus;
            this.presentToast(
              'Goods receipt created successfully',"success");
              this.item.QtyRemaining = this.item.QtyRemaining - parseInt(this.inputQuantity);
              this.item.QtyReceived = this.item.QtyReceived + parseInt(this.inputQuantity);
              this.sqliteService.insertTransaction(transactionPayload, "TransactionHistoryTable");
          } else {
            transactionPayload.status = response.Response[0].RecordStatus;
            transactionPayload.error = response.Response[0].Message;
            this.presentToast(response.Response[0].Message);
             this.sqliteService.insertTransaction(transactionPayload, "TransactionHistoryTable");
          }
        },
        
        error => {
          console.error('Error:', error);
        }
      );
    } catch (error) {
      console.error('Error in createGoodsReceipt:', error);
    }
    }
    else if(this.isOnline==false){
      this.item.QtyRemaining = this.item.QtyRemaining - parseInt(this.inputQuantity);
      this.item.QtyReceived = this.item.QtyReceived + parseInt(this.inputQuantity);
        await this.sqliteService.insertTransaction(transactionPayload, "TransactionHistoryTable");
        this.presentToast( 'Goods receipt saved offline',"success");    
         
      
    } 
  }

  async receiveAndPrint() {
      try {
      
      let hasErrors = false;

      if (this.inputQuantity <= 0) {
          await this.presentToast('Receipt Quantity cannot be zero or empty');
          hasErrors = true;
      }

      if (this.destinationType === "Inventory") {
          if (!this.selectedSubInventoryCode) {
              await this.presentToast('Please select Sub Inventory Code');
              hasErrors = true;
          }
          if (!this.inputLocator) {
              await this.presentToast('Please select Locator Code');
              hasErrors = true;
          }
      }

      if (this.isSerialControlled && this.selectedSerialCount === 0) {
          await this.presentToast('Please select Serial Number');
          hasErrors = true;
      }

      if (this.isLotControlled && this.selectedLotCount === 0) {
          await this.presentToast('Please select Lot Number');
          hasErrors = true;
      }

      
      if (hasErrors) {
          return;
      }
        const loginResponse = await this.storage.get('loginResponse');
        let responsibilityId = null;

        if (loginResponse && loginResponse.length > 0) {
            this.employeeId = loginResponse[0].PERSON_ID;
            responsibilityId = loginResponse[0].RESPONSIBILITY_ID;
            this.UserId = loginResponse[0].USER_ID;
        } else {
            console.error('No login response found in storage');
            return;
        }

        if (!responsibilityId) {
            console.error('ResponsibilityId not found in login response.');
            return;
        }

        this.createGoodsReceipt();

               
        
    } catch (error) {
        console.error('Error in receiveAndPrint:', error);
    }
}
onlinePayload(){
  const randomDummyReceiptNumber = Math.floor(Math.random() * 1e13).toString();
  const mobileTransactionId = Date.now() + Math.floor(Math.random() * 1e6);
  const payload = {
    Input: {
          parts: [
              {
                  id: "part1",
                  path: "/receivingReceiptRequests",
                  operation: "create",
                  payload:{
                    ReceiptSourceCode: this.item.ReceiptSourceCode,
                    EmployeeId: this.employeeId,
                    BusinessUnitId: this.selectedOrganization.BusinessUnitId,
                    ReceiptNumber: "",
                    BillOfLading: this.item.BillOfLading,
                    FreightCarrierName: this.item.FreightCarrierName,
                    PackingSlip: this.item.Packingslip,
                    WaybillAirbillNumber: this.item.WayBillAirBillNumber,
                    ShipmentNumber: this.shipmentNumber,    
                    VendorSiteId:this.item.VendorSiteId,
                    VendorId: this.item.VendorId,
                    attachments: [],
                    CustomerId: this.item.CustomerId,
                    InventoryOrgId: this.selectedOrganization.InventoryOrgId,
                    DeliveryDate: "08-Oct-2024 00:51",
                    ResponsibilityId: "21623",
                    UserId: this.UserId,
                    DummyReceiptNumber: randomDummyReceiptNumber,
                    BusinessUnit: "Vision Operations",
                    InsertAndProcessFlag: "true",
                    lines: [
                  {
                    ReceiptSourceCode: this.item.ReceiptSourceCode,
                    MobileTransactionId: mobileTransactionId,
                    TransactionType: "RECEIVE",
                    AutoTransactCode: "RECEIVE",
                    DocumentNumber: this.item.PoNumber,
                    DocumentLineNumber: this.item.PoShipmentNumber,
                    ItemNumber: this.item.ItemNumber,
                    TransactionDate: "08-Oct-2024 00:51",
                    Quantity: this.inputQuantity,
                    UnitOfMeasure: this.item.UnitOfMeasure,
                    SoldtoLegalEntity: this.item.SoldtoLegalEntity,
                    SecondaryUnitOfMeasure: '',
                    ShipmentHeaderId: this.item.ShipmentHeaderId,
                    ItemRevision:this.item.ItemRevision ,
                    POHeaderId: this.item.PoHeaderId,
                    POLineLocationId: this.item.PoLineLocationId,
                    POLineId: this.item.PoLineId,
                    PODistributionId: this.item.PoDistributionId,
                    ReasonName: this.item.ReasonName,
                    Comments: this.item.Comments,
                    ShipmentLineId: this.item.ShipmentLineId,
                    transactionAttachments: [],
                    lotItemLots: this.convertedLotData,
                    serialItemSerials:this.serialData.map((serial:any)=>({
                      FromSerialNumber:serial,
                      ToSerialNumber:serial,
                      })) ,
                      lotSerialItemLots: [],
                      ExternalSystemTransactionReference: "Mobile Transaction",
                      ReceiptAdviceHeaderId:this.item.ReceiptAdviceHeaderId,
                      ReceiptAdviceLineId: this.item.ReceiptAdviceLineId,
                      TransferOrderHeaderId: this.item.TransferOrderHeaderId,
                      TransferOrderLineId: this.item.TransferOrderLineId,
                      PoLineLocationId: this.item.PoLineLocationId    ,
                      DestinationTypeCode: this.item.DestinationType,
                      Subinventory: this.selectedSubInventoryCode,
                      Locator: this.inputLocator,
                      ShipmentNumber:this.item.ShipmentNumber,
                      LpnId:this.item.LpnId,
                      OrderLineId: this.item.OrderLineId
                  }
              ]
          }
      }
  ]
}
}
console.log(payload)
return payload
} 


transactionOfflinePayload() {
  const offlinePayload = {
    poNumber: this.item.PoNumber,
    titleName: 'Goods Receipt',
    syncStatus: new Date(),
    createdTime: new Date(),
    quantityReceived: this.inputQuantity,
    receiptInfo: 'N/A',
    error: '',
    status: 'local',
    shipLaneNum: this.item.PoShipmentNumber,
    vendorId: this.item.VendorId,
    unitOfMeasure: this.item.ItemUom,
    poHeaderId: this.item.PoHeaderId,
    poLineLocationId: this.item.PoLineLocationId,
    poLineId: this.item.PoLineId,
    poDistributionId: this.item.PoDistributionId,
    destinationTypeCode: this.item.DestinationType,
    itemNumber: this.item.ItemNumber,
    Subinventory: this.selectedSubInventoryCode,
    Locator: this.inputLocator,
    ShipmentNumber: "",
    LpnNumber: "",
    OrderLineId: "",
    SoldtoLegalEntity: "",
    SecondaryUnitOfMeasure: "",
    ShipmentHeaderId: "",
    ItemRevision: this.item.ItemRevision,
    ReceiptSourceCode: "",
    MobileTransactionId: "1234567892233",
    TransactionType: "RECEIVE",
    AutoTransactCode: "DELIVER",
    OrganizationCode: "",
    serialNumbers: this.serialData.length > 0 ? this.serialData.join(',') : " ",
    // lotQuantity: this.convertedLotData.TransactionQuantity,
    // lotCode: this.convertedLotData.LotNumber,
  };
 
  return offlinePayload;
}
  navigateHome() {
        this.router.navigate(['/dashboard']);
      }
    
      navigateBack() {
        if (this.poNumber) {
          this.router.navigate([`items-page/${this.poNumber}`]);
        } else {
          this.router.navigate(['/items-page']);
        }
      }
    }
