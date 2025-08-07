<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('sub_category_id')->nullable();
            $table->text('description')->nullable();
            $table->decimal('price', 8, 2)->default(0.00);
            $table->string('book_file')->nullable();       // path to the book PDF or file
            $table->string('cover_image')->nullable();     // path to cover image
            $table->string('status', 20)->default('active');

            $table->timestamps();

            // Foreign keys
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->foreign('sub_category_id')->references('id')->on('sub_categories')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
