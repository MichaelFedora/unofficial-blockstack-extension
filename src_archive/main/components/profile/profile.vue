<template>
<div id='bs-main-profile' class='modal-card' style='width: auto'>
  <header class='modal-card-head'>
    <h1 class='modal-card-title'>Profile</h1>
  </header>
  <section class='modal-card-body'>
    <template v-if='!editing'>
      <h3 class='is-title is-4' :class='{ empty: !name }'>{{name || 'Anonymous'}}</h3>
      <h4 class='is-title is-5' v-if='username'>{{username}}</h4>
      <button v-else class='button' disabled title='Not Yet Implemented'>Add a Username</button>
      <span>ID-{{id}}</span>
      <p :class='{ empty: !bio }'>{{bio || 'I am a secretive person.'}}</p>
    </template>
    <template v-else>
      <form>
        <b-field label='Name'>
          <b-input placeholder='Anonymous' v-modal='name' style='text-align: center'></b-input>
        </b-field>
        <b-field label='Short Bio'>
          <b-input placeholder='I am a secretive person.' type='textarea' v-modal='newbio' style='text-align: center'></b-input>
        </b-field>
        <p><i>Accounts and Verifications are not yet implemented</i></p>
      </form>
    </template>
  </section>
  <footer v-if='isSelf' class='modal-card-foot'>
    <template v-if='editing'>
      <button class='button' @click='editing = false'>Cancel</button>
      <button class='button' @click='save()'>Save</button>
    </template>
    <template v-else>
      <button class='button' @click='editing = true'>Edit Profile</button>
      <button class='button' @click='$parent.close()'>Done</button>
    </template>
  </footer>
</div>
</template>
<script src='./profile.ts'></script>
<style lang='scss'>
#bs-main-profile {
  display: flex;
  justify-content: center;
  > div {

  }
}
</style>
