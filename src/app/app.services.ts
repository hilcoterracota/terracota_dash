import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppRepository } from './app.repository';
import { MsalService } from '@azure/msal-angular';

@Injectable({
    providedIn: 'root'
})

export class AppService {

    public session: Boolean
    public isTerra: boolean

    constructor(
        private repo: AppRepository,
        private router: Router,
        private azurems: MsalService
    ) {
        this.session = JSON.parse(sessionStorage.getItem("session"));
        this.isTerra = JSON.parse(sessionStorage.getItem("isTerra"));
    }

    public login(data, isTerra): void {
        this.isTerra = isTerra;
        if (this.isTerra) {
            this.azurems.loginPopup(["user.read"]).then(loginResponse => {
                this.setSession("true");
                this.setIsTerra("true");
                this.repo.post("sag/Account/V1/GenerateNewToken", { username: this.azurems.getUser()["displayableId"] }, "Generando conexión segura", "Espere un momento").then(response => {
                    sessionStorage.setItem("token", response.token)
                    this.session = true
                    this.router.navigate(["/dashboard"])
                })
            }).catch(function (error) {
                console.log(error);
            });
        } else {
            this.repo.post("sag/Account/V1/Login", data, "Iniciando sesión", "Espere un momento").then(response => {
                sessionStorage.setItem("token", response.token)
                this.session = true
                this.router.navigate(["/dashboard"])
            })
        }
    }

    public getStatusSession(): void {
        this.repo.get("sag/Account/V1/GetStatusSession", null, "Validando sesión", "Espere un momento").then(response => {
            if (response == "ERROR") {
                this.session = false
                sessionStorage.clear()
                if (this.isTerra) {
                    window.location.href = '/login';
                }
            }
        })
    }

    public logout(): void {
        sessionStorage.clear()
        this.isTerra = false
        window.location.href = '/login';
    }

    public setSession(data) {
        sessionStorage.setItem("session", data)
        this.session = JSON.parse(sessionStorage.getItem("session"));
    }

    public setIsTerra(data) {
        sessionStorage.setItem("isTerra", data)
        this.isTerra = JSON.parse(sessionStorage.getItem("isTerra"));
    }

}
