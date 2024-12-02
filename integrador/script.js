// Variáveis globais
let recipes = []; // Array global com as receitas
let editingIndex = null; // Rastreia qual receita está sendo editada
const API_BASE_URL = "https://pj-atila-c4c3gkhadygheghs.brazilsouth-01.azurewebsites.net"; // Base URL da API

// Função para buscar todas as receitas
async function getAllRecipes() {
    try {
        console.log('Buscando receitas...');
        const response = await fetch(`${API_BASE_URL}/recipes`, { method: 'GET' });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao buscar receitas: ${response.status} ${errorText}`);
        }

        recipes = await response.json(); // Armazena as receitas aqui
        console.log('Lista de receitas:', recipes);
        return recipes;
    } catch (error) {
        console.error('Erro ao buscar receitas:', error);
        throw error;
    }
}

// Função para adicionar uma nova receita
async function addRecipe(recipeTitle, description, url) {
    try {
        const response = await fetch(`${API_BASE_URL}/recipes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: recipeTitle, description, url }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao adicionar receita: ${response.status} ${errorText}`);
        }

        const newRecipe = await response.json();
        console.log('Receita adicionada:', newRecipe);
        recipes.push(newRecipe); // Adiciona a nova receita no array local
        return newRecipe;
    } catch (error) {
        console.error('Erro ao adicionar receita:', error);
        throw error;
    }
}

// Função para excluir uma receita
async function deleteRecipe(recipeId) {
   try {
       const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, { method: 'DELETE' });

       if (!response.ok) {
           const errorText = await response.text();
           throw new Error(`Erro ao excluir receita: ${response.status} ${errorText}`);
       }

       console.log(`Receita com ID ${recipeId} excluída.`);
       recipes = recipes.filter(recipe => recipe.id !== recipeId); // Atualiza o array local
   } catch (error) {
       console.error('Erro ao excluir receita:', error);
       throw error;
   }
}

// Função para editar uma receita
async function updateRecipe(recipeId, recipeTitle, description, url) {
   try {
       const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ title: recipeTitle, description, url }),
       });

       if (!response.ok) {
           const errorText = await response.text();
           throw new Error(`Erro ao editar receita: ${response.status} ${errorText}`);
       }

       const updatedRecipe = await response.json();
       console.log('Receita atualizada:', updatedRecipe);

       // Atualiza a receita no array local
       const index = recipes.findIndex(recipe => recipe.id === recipeId);
       if (index !== -1) {
           recipes[index] = updatedRecipe;
       }

       return updatedRecipe;
   } catch (error) {
       console.error('Erro ao editar receita:', error);
       throw error;
   }
}

// Função para mostrar todas as receitas
async function displayRecipes() {
   try {
       // Garantir que as receitas estejam atualizadas
       if (recipes.length === 0) {
           await getAllRecipes(); // Buscar da API se não houver receitas carregadas
       }

       const recipeList = document.getElementById('recipe-list');
       recipeList.innerHTML = ''; // Limpar a lista antes de exibir

       recipes.forEach((recipe, index) => {
           const recipeItem = document.createElement('div');
           recipeItem.className = 'recipe-item'; // Classe para estilização
           recipeItem.innerHTML = `
               <h3>${recipe.title}</h3>
               <p><strong>Descrição:</strong> ${recipe.description}</p>
               <button onclick="editRecipe(${index})">Editar Receita</button>
               <button class="btn-excluir" onclick="removeRecipe(${index})">Excluir Receita</button>
               <hr>
           `;
           recipeList.appendChild(recipeItem);
       });
   } catch (error) {
       console.error('Erro ao exibir as receitas:', error);
   }
}

// Função chamada ao enviar o formulário de receita
document.addEventListener('DOMContentLoaded', function() {
   const form = document.getElementById('recipeForm');
   const submitButton = document.getElementById('submitButton');
   const messageDiv = document.getElementById('message');

   submitButton.addEventListener('click', async function(event) {
       event.preventDefault(); // Evita o envio padrão do formulário

       const formData = new FormData(form);

       // Captura os dados do formulário e cria um objeto JSON
       const recipeName = formData.get('nomeReceita');
       const description = formData.get('ingredientes'); 
       const url = formData.get('modoPreparo'); 
       
       if (editingIndex !== null) {
           // Atualizar a receita existente na API
           const recipeToUpdate = recipes[editingIndex];
           await updateRecipe(recipeToUpdate.id, recipeName, description, url); 
           editingIndex = null; // Resetar o índice de edição
           messageDiv.innerHTML = "Receita atualizada com sucesso!";
       } else {
           // Adicionar nova receita
           await addRecipe(recipeName, description, url); 
           messageDiv.innerHTML = "Receita criada com sucesso!";
       }

       // Limpar o formulário após a submissão
       form.reset();

       // Exibir as receitas atualizadas
       displayRecipes();
   });
});

// Função para remover uma receita
async function removeRecipe(index) {
   const recipeId = recipes[index].id; 
   await deleteRecipe(recipeId);  
   displayRecipes();  
}

// Função para editar uma receita
function editRecipe(index) {
   const recipe = recipes[index];
   document.getElementById('nomeReceita').value = recipe.title; // Corrigido para usar o ID correto
   document.getElementById('ingredientes').value = recipe.description; 
   document.getElementById('modoPreparo').value = recipe.url; 
   editingIndex = index; 
}

// Função para inicializar o carregamento das receitas
window.onload = async function() {
   try {
       await getAllRecipes(); 
       displayRecipes();
   } catch (error) {
       console.error('Erro no fluxo inicial:', error);
   }
};