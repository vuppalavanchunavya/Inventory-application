import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private apiUrl: string = 'https://testnode.propelapps.com/';
  private Api_Route: string = 'EBS/20D/';

  private Api_Endpoints = { 
    login: 'login',
    getInventoryOrganizations: 'getInventoryOrganizations', 
    createGoodsReceiptTransactions: 'createGoodsReceiptTransactions' // New endpoint added
  }

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const credentials = { username, password };
    const url = this.apiUrl + this.Api_Route + this.Api_Endpoints.login;
    return this.http.post<any>(url, credentials);
  }

  getInventoryOrganizationsMetadata(): Observable<any> {
    const url = `${this.apiUrl + this.Api_Route}getInventoryOrganizations/metadata`;
    return this.http.get<any>(url);
  }

  getInventoryOrganizations(defOrgCode: string): Observable<any> {
    const url = `${this.apiUrl + this.Api_Route}${this.Api_Endpoints.getInventoryOrganizations}/${defOrgCode}`;
    return this.http.get<any>(url);
  }

  createGoodsReceiptTransactions(payload: any): Observable<any> {
    const url = this.apiUrl + this.Api_Route + this.Api_Endpoints.createGoodsReceiptTransactions;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(url, payload, { headers });
  }
}

  
  
