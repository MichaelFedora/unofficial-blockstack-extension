<template>
<div id='bs-main-manage-identities' class='modal-card'>
  <header class='modal-card-head'>
    <p class='modal-card-title'>Manage Identities</p>
  </header>

  <section class='modal-card-body'>
    <div v-for='(identity, index) in localIdentities' :key='index'>
      <b-radio v-model='chosenIdIndex' :native-value='index'></b-radio>
      <div>
        <span>{{getProfileName(identity)}}</span>
        <span>ID-{{identity.ownerAddress}}</span>
      </div>
      <button class='button' @click='remove(index)' :class='{ "is-loading": removing[index], "is-danger": !!index, "is-primary": !index }' :disabled='removing[index] || !index'>
        <b-icon :icon='!index ? "crown" : "minus-circle"'></b-icon>
      </button>
    </div>
  </section>
  <footer class='modal-card-foot' style='display: flex; justify-content: space-between'>
    <button class='button' @click='deriveNewIdentity()'>
      <b-icon icon='account-plus'></b-icon>
      <span>New Identity</span>
    </button>
    <button class='button is-primary' @click='$parent.close()'>
      <b-icon icon='check'></b-icon>
      <span>Done</span>
    </button>
  </footer>
</div>
</template>
<script src='./manage-identities.ts'></script>
<style lang='scss'>
#bs-main-manage-identities {
  width: auto;
  > section.modal-card-body {
    > div {
      display: flex;
      align-items: center;
      margin: 0.5rem 0;
      > div {
        flex-grow: 1;
        margin-right: 1rem;
        display: flex;
        flex-flow: column;
        > span:first-child {
          font-weight: 600;
        }
        > span:last-child {
          font-size: 0.67em;
        }
      }
    }
  }
}
</style>
