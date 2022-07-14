<template>
<div class="container-fluid h-100 d-flex align-items-center justify-content-center app" style="background-color:#F0F4FF" id="app">
    <div class="login-box card p-3">
        <div class="row">
            <div class="d-flex direction-row align-center mb-4">
                <div class="fs-4 bg-success text-white px-4 rounded-pill"> <i class="fas fa-money-bill-wave-alt text-white"></i> minha carteira</div>
            </div>
        </div>

        <div class="row mb-3">
            <h3>Login</h3>
        </div>

        <form class="needs-validation" id="form-login" @submit.prevent="login()">
            <div class="row g-2">
                <div class="form-floating mb-3 col-lg-12">
                    <input type="email" v-bind:class="{'is-invalid': errors.usu_email}" v-model="user.usu_email" @change.self="clearErrors($event)" class="form-control" id="email" name="usu_email" placeholder="E-mail" required>
                    <label for="floatingInput">E-mail</label>
                    <div class="invalid-feedback text-danger" id="msg_usu_email">{{errors.usu_email}}</div>
                </div>
            </div>

            <div class="row g-2">
                <div class="form-floating mb-2 col-lg-12">
                    <input type="password" v-bind:class="{'is-invalid': errors.usu_senha}" v-model="user.usu_senha" @change.self="clearErrors($event)" class="form-control" id="senha" name="usu_senha" placeholder="Senha" required>
                    <label for="floatingInput">Senha</label>
                    <div class="invalid-feedback text-danger" id="msg_usu_senha">{{errors.usu_senha}}</div>
                </div>
            </div>

            <div class="row g-2 mt-2">
                <input type="submit" class="btn btn-success btn-lg text-white" value="Entrar">
            </div>

            <div class="row g-2 mt-4">
                <div class="col-6">
                    <router-link to="/cadastro" class="text-success">Não possuo uma conta</router-link>
                </div>

                <div class="col-6 text-end">
                    <a href="" class="text-success ">Esqueci minha senha</a>
                </div>
            </div>
        </form>
    </div>

    <div class="loading w-100 h-100" v-if="loading == true">
        <div class="spinner-border fs-6 text-white" style="width: 5rem; height: 5rem;" role="status">
            <span class="sr-only">Loading...</span>
        </div>
    </div>
</div>


</template>

<style src="@/assets/css/login.css" scoped>
</style>

<!-- Importação do model -->
<script lang="ts">
  import Login from "@/models/Login"
  export default Login
</script>