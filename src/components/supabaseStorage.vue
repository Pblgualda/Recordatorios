<script setup>
import { supabase } from '../supabase.js'

var archivo;

function adjuntarArchivo(e)
{
    archivo = e.target.files[0];
    console.log(archivo);
}
async function altaRecordatorio()
{
    if (archivo)
    {
        //antes de escribir en la bd neccesito subir el arhcivo a supabase
        const { data, error } = await supabase.storage.from('Storage').upload(archivo.name,archivo.value)
        if(error)
        {
            console.log(error);
            errorEnSubida = true;
        }
        else
        {
            console.log("perfe");
            errorEnSubida = false;
        }
    }
    if (!archivo || !errorEnSubida)
    {

        const  {data} = supabase.storage.from('Storage').getPublicUrl(archivo.name)
        console.log(data.publicUrl);
        //escribir en la bd sin archivo

    }
}
</script>


<template>
    <form @submit.prevent="altaRecordatorio">
        <input type="file" @change="adjuntarArchivo">
        <button type="submit">Subir Archivo</button>
    </form>
</template>