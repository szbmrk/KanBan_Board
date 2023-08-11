<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $primaryKey = 'role_id';
    protected $table = 'roles';
    public $timestamps = false;

    protected $fillable = [
        'name',
        'board_id'
    ];

    public function board()
    {
        return $this->belongsTo(Board::class, 'board_id', 'board_id');
    }
    public function teamMemberRoles()
    {
        return $this->hasMany(TeamMemberRole::class, 'role_id', 'role_id');
    }

    public function permissions()
{
    return $this->belongsToMany(Permission::class, 'permission_role', 'role_id', 'permission_id');
}
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_role', 'role_id', 'user_id');
    }


}
