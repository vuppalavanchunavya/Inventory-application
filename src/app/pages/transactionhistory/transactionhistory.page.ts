import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-transactionhistory',
  templateUrl: './transactionhistory.page.html',
  styleUrls: ['./transactionhistory.page.scss'],
})
export class TransactionhistoryPage implements OnInit {
  tableData: any[] = [];
  LocalTableData: any[] = [];
  selectedOrganization: any;
  employeeId: string = '';
  UserId: string = '';

  constructor(
    private sqliteService: SQLiteService,
    private router: Router,
    private toastController: ToastController,
    private storage: Storage
  ) {}

   async ngOnInit() {
    await  this.storage.create();
    this.selectedOrganization = await this.storage.get('selectedorg');
    this.getTransactionData();
    this.loadLoginResponse();
  }
  
  async loadLoginResponse() {
    const loginResponse = await this.storage.get('loginResponse');
    if (loginResponse && loginResponse.length > 0) {
      this.employeeId = loginResponse[0].PERSON_ID;
      this.UserId = loginResponse[0].USER_ID;
    } else {
      console.error('No login response found in storage');
    }
  }

  navigateBack() {
    this.router.navigate(['/dashboard']);
  }


  async getTransactionData() {
    this.tableData = await this.sqliteService.getDataFromTable("TransactionHistoryTable");
    console.log(this.tableData);
    this.LocalTableData = this.tableData.filter((item: any) => item.status === 'local');
    console.log("localtable data",this.LocalTableData)
  }

  async SyncData() {
    const payload = this.getPayload();

    if (payload && payload.Input.parts[0].payload.lines.length > 0) {
        try {
            
            const response = await this.callCreateGoodsReceiptTransactionsAPI(payload);
          console.log(response);
          response.Response.forEach((Item: any) => {
            const { PoLineLocationId, RecordStatus } = Item;


            const findItem=this.tableData.findIndex((element:any)=>
              element.poLineLocationId==PoLineLocationId
            )

            this.tableData[findItem].status=RecordStatus;


            const findLocalItem=this.LocalTableData.findIndex((element:any)=>
              element.poLineLocationId==PoLineLocationId
            )
            this.LocalTableData[findLocalItem].status=RecordStatus;


            this.sqliteService.executeQuery(
                          'UPDATE TransactionHistoryTable SET status = ?  WHERE poLineLocationId= ?',
                          [RecordStatus,PoLineLocationId]
                      );

          });

          this.getTransactionData();
        } catch (error) {
            console.error('Sync error:', error);
            this.LocalTableData.forEach((item: any) => {
                item.status = 'E'; 
                item.error = error instanceof Error ? error.message : String(error) || 'API sync error';

                
                this.sqliteService.executeQuery(
                    'UPDATE TransactionHistoryTable SET status = ?, error = ? WHERE id = ?',
                    [item.status, item.error, item.id]
                );
            });
        }

        
        this.showToast('Sync complete');
         
    } else {
        this.showToast('No transactions remaining to sync');
    }
}
  
  getPayload() {
    if (this.LocalTableData.length > 0) {
        const payload = this.goodsReceipt();
        return payload;
    } else {
        this.showToast("no transactions remaining");
        return null;
    }
}
  async refreshData(event: any) {
    await this.getTransactionData();
    event.target.complete();
  }

  async deleteTransaction(id: number) {
    const index = this.tableData.findIndex((transaction: any) => transaction.id === id);
    
    if (index !== -1) {
      this.tableData.splice(index, 1);
      
      
      await this.sqliteService.executeQuery(`DELETE FROM TransactionHistoryTable WHERE id = ?`, [id]);
      
      
      this.LocalTableData = this.LocalTableData.filter((item: any) => item.id !== id);
      
      this.showToast('Transaction deleted successfully');
    } else {
      this.showToast('Transaction not found');
    }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
    });
    await toast.present();
  }

  
 
  
  goodsReceipt() {
    const randomDummyReceiptNumber = Math.floor(Math.random() * 1e13).toString();
    const mobileTransactionId = Date.now() + Math.floor(Math.random() * 1e6);
    const payload = {
      Input: {
        parts: [
                {
                    id: "part1",
                    path: "/receivingReceiptRequests",
                    operation: "create",
                    payload: {
                      ReceiptSourceCode: this.LocalTableData[0].ReceiptSourceCode, 
                      EmployeeId:this.employeeId,
                      BusinessUnitId: this.selectedOrganization.BusinessUnitId,
                      ReceiptNumber: "",
                      BillOfLading: this.LocalTableData[0].BillOfLading,
                      FreightCarrierName: this.LocalTableData[0].FreightCarrierName,
                      PackingSlip:  this.LocalTableData[0].Packingslip,
                      WaybillAirbillNumber: this.LocalTableData[0].WayBillAirBillNumber,
                      ShipmentNumber: this.LocalTableData[0].ShipmentNumber,
                      VendorSiteId: this.LocalTableData[0].VendorSiteId,
                      VendorId: this.LocalTableData[0].vendorId,
                      attachments: [],
                      CustomerId: this.LocalTableData[0].CustomerId,
                      InventoryOrgId: this.selectedOrganization.InventoryOrgId,
                      DeliveryDate: "08-Oct-2024 00:51",
                      ResponsibilityId: "21623",
                      UserId: this.UserId,
                      DummyReceiptNumber: randomDummyReceiptNumber,
                      BusinessUnit: "Vision Operations",
                      InsertAndProcessFlag: "true",
                      lines: this.LocalTableData.map((item: any, i: any) => ({
                        ReceiptSourceCode: item.ReceiptSourceCode,
                        MobileTransactionId: mobileTransactionId,
                        TransactionType: "RECEIVE",
                        AutoTransactCode: "RECEIVE",
                        DocumentNumber: item.PoNumber,
                        DocumentLineNumber: item.PoShipmentNumber,
                        ItemNumber: item.itemNumber,
                        TransactionDate: "08-Oct-2024 01:51",
                        Quantity: item.quantityReceived,
                        UnitOfMeasure: item.UnitOfMeasure,
                        SoldtoLegalEntity: item.SoldtoLegalEntity,
                        SecondaryUnitOfMeasure: item.SecondaryUnitOfMeasure,
                        ShipmentHeaderId: item.ShipmentHeaderId,
                        ItemRevision: item.ItemRevision,
                        POHeaderId: item.poHeaderId,
                        POLineLocationId: item.poLineLocationId,
                        POLineId: item.PoLineId,
                        PODistributionId: item.PoDistributionId,
                        ReasonName: item.ReasonName,
                        Comments: item.Comments,
                        ShipmentLineId: item.ShipmentLineId,
                        transactionAttachments: [],
                        lotItemLots: item.lotItemLots,
                        serialItemSerials: (item.serialData || []).map((serial: any) => ({
                          FromSerialNumber: serial,
                          ToSerialNumber: serial,
                            })),
                            lotSerialItemLots: [],
                            ExternalSystemTransactionReference: "Mobile Transaction",
                            ReceiptAdviceHeaderId: item.ReceiptAdviceHeaderId,
                            ReceiptAdviceLineId: item.ReceiptAdviceLineId,
                            TransferOrderHeaderId: item.TransferOrderHeaderId,
                            TransferOrderLineId: item.TransferOrderLineId,
                            PoLineLocationId: item.poLineLocationId,
                            DestinationTypeCode: item.destinationTypeCode,
                            Subinventory: item.Subinventory,
                            Locator: item.Locator,
                            ShipmentNumber: item.ShipmentNumber,
                            LpnId: item.LpnId,
                            OrderLineId: item.OrderLineId
                        }))
                    }
                }
            ]
        }
    };
    console.log(payload)
    return payload;
}

  async callCreateGoodsReceiptTransactionsAPI(payload: any) {
    try {
      const response = await fetch('https://testnode.propelapps.com/EBS/20D/createGoodsReceiptTransactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
  
      const result = await response.json();
      return result;
      
    } catch (error) {
      
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message; 
      } else {
        errorMessage = String(error); 
      }
  
      console.error('API error:', errorMessage);
      throw new Error(errorMessage || 'Failed to sync transaction');
    }
  }
  
}
